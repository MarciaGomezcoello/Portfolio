/* ============================================================================
   comprimir-video — makes a video small enough for the website.

     comprimir-video <entrada> <salida.mp4> <foto.jpg>

   A video straight from a phone or an AI tool is often 10–100 MB, far more
   than a short clip on a web page needs. This uses the Mac's own video engine
   (AVFoundation — nothing to install) to write an H.264 MP4, which every
   browser plays, no larger than 960 px on its long side and at a bit rate that
   keeps it sharp at the size the site shows it: about 4 MB for 20 seconds.
   It also saves a still from the first moment, for the picture that sits
   under the play button.

   It talks to the editor's server on standard output, one line at a time:
     progress 0.42      how far along, from 0 to 1
     done 20.0          finished; the video's length in seconds
     error <message>    something went wrong (also exits with status 1)
   ============================================================================ */

import AVFoundation
import AppKit

setvbuf(stdout, nil, _IONBF, 0)

func fail(_ message: String) -> Never {
    print("error \(message)")
    exit(1)
}

let args = CommandLine.arguments
guard args.count == 4 else { fail("uso: comprimir-video <entrada> <salida.mp4> <foto.jpg>") }
let source = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let posterURL = URL(fileURLWithPath: args[3])
try? FileManager.default.removeItem(at: output)

let asset = AVURLAsset(url: source)
let duration = asset.duration.seconds
guard let videoTrack = asset.tracks(withMediaType: .video).first, duration > 0 else {
    fail("no es un video que se pueda leer")
}

/* --- Size and bit rate -------------------------------------------------------
   The stored frame (naturalSize) is scaled so its long side is at most 960 px,
   never enlarged, and kept to even numbers, which H.264 requires. A phone
   video filmed upright is stored sideways with a turn to apply; that turn is
   copied to the new file, so it plays upright exactly as before. */
let natural = videoTrack.naturalSize
let longSide = max(natural.width, natural.height)
let scale = min(1, 960 / longSide)
func even(_ v: CGFloat) -> Int { max(2, Int((v * scale / 2).rounded()) * 2) }
let width = even(natural.width)
let height = even(natural.height)
// 1.5 Mbit/s at 960×540, in proportion to the number of pixels.
let bitRate = max(400_000, Int(1_500_000 * Double(width * height) / Double(960 * 540)))

/* --- Reader and writer ----------------------------------------------------- */
let reader: AVAssetReader
let writer: AVAssetWriter
do {
    reader = try AVAssetReader(asset: asset)
    writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
} catch {
    fail(error.localizedDescription)
}
writer.shouldOptimizeForNetworkUse = true // starts playing before it has all arrived

let videoOut = AVAssetReaderTrackOutput(track: videoTrack, outputSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
])
videoOut.alwaysCopiesSampleData = false
reader.add(videoOut)

let videoIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
    AVVideoColorPropertiesKey: [
        AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
        AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
        AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
    ],
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: bitRate,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalDurationKey: 2,
    ],
])
videoIn.transform = videoTrack.preferredTransform
videoIn.expectsMediaDataInRealTime = false
writer.add(videoIn)

var audioOut: AVAssetReaderTrackOutput?
var audioIn: AVAssetWriterInput?
if let audioTrack = asset.tracks(withMediaType: .audio).first {
    let out = AVAssetReaderTrackOutput(track: audioTrack, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM])
    let input = AVAssetWriterInput(mediaType: .audio, outputSettings: [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVNumberOfChannelsKey: 2,
        AVSampleRateKey: 44_100,
        AVEncoderBitRateKey: 96_000,
    ])
    input.expectsMediaDataInRealTime = false
    if reader.canAdd(out) && writer.canAdd(input) {
        reader.add(out)
        writer.add(input)
        audioOut = out
        audioIn = input
    }
}

guard reader.startReading() else { fail(reader.error?.localizedDescription ?? "no se pudo leer el video") }
guard writer.startWriting() else { fail(writer.error?.localizedDescription ?? "no se pudo escribir el video") }
writer.startSession(atSourceTime: .zero)

/* --- Copy, reporting progress from the video's own clock ------------------- */
let group = DispatchGroup()
let lock = NSLock()
var lastShown = -1

func report(_ seconds: Double) {
    let step = Int(min(max(seconds / duration, 0), 0.99) * 100)
    lock.lock(); defer { lock.unlock() }
    if step > lastShown {
        lastShown = step
        print("progress \(Double(step) / 100)")
    }
}

func pump(_ input: AVAssetWriterInput, _ output: AVAssetReaderTrackOutput, _ label: String, showsProgress: Bool) {
    group.enter()
    input.requestMediaDataWhenReady(on: DispatchQueue(label: label)) {
        while input.isReadyForMoreMediaData {
            guard reader.status == .reading, let buffer = output.copyNextSampleBuffer() else {
                input.markAsFinished()
                group.leave()
                return
            }
            if showsProgress { report(CMSampleBufferGetPresentationTimeStamp(buffer).seconds) }
            if !input.append(buffer) {
                reader.cancelReading()
            }
        }
    }
}

pump(videoIn, videoOut, "video", showsProgress: true)
if let a = audioIn, let o = audioOut { pump(a, o, "audio", showsProgress: false) }
group.wait()

if reader.status == .failed || writer.status == .failed {
    writer.cancelWriting()
    fail((writer.error ?? reader.error)?.localizedDescription ?? "falló la compresión")
}
let finished = DispatchSemaphore(value: 0)
writer.finishWriting { finished.signal() }
finished.wait()
guard writer.status == .completed else { fail(writer.error?.localizedDescription ?? "no se terminó de escribir") }

// Arranging the file to start playing early leaves a working copy beside it
// (name.mp4.sb-…). It is not needed once the file is finished.
let folder = output.deletingLastPathComponent()
for leftover in (try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? []
where leftover.hasPrefix(output.lastPathComponent + ".sb-") {
    try? FileManager.default.removeItem(at: folder.appendingPathComponent(leftover))
}

/* --- The still under the play button --------------------------------------- */
let stills = AVAssetImageGenerator(asset: AVURLAsset(url: output))
stills.appliesPreferredTrackTransform = true
stills.maximumSize = CGSize(width: 960, height: 960)
stills.requestedTimeToleranceBefore = .zero
stills.requestedTimeToleranceAfter = CMTime(seconds: 0.5, preferredTimescale: 600)
if let frame = try? stills.copyCGImage(at: CMTime(seconds: min(0.2, duration / 2), preferredTimescale: 600), actualTime: nil),
   let jpeg = NSBitmapImageRep(cgImage: frame).representation(using: .jpeg, properties: [.compressionFactor: 0.82]) {
    try? jpeg.write(to: posterURL)
}

print("done \(String(format: "%.1f", duration))")
