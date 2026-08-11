import ExpoModulesCore
import TrueSDK

private final class TruecallerDelegateProxy: NSObject, TCTrueSDKDelegate {
  weak var module: ExpoTruecallerModule?

  func didReceive(_ profile: TCTrueProfile) {
    module?.handleDidReceive(profile)
  }

  func didFailToReceiveTrueProfileWithError(_ error: TCError) {
    module?.handleDidFailToReceiveTrueProfile(error)
  }

  @objc(willRequestProfileWithNonce:)
  func willRequestProfile(withNonce nonce: String) {
    module?.handleWillRequestProfile(nonce: nonce)
  }

  @objc(didReceiveTrueProfileResponse:)
  func didReceiveProfileResponse(_ profileResponse: TCTrueProfileResponse) {
    module?.handleDidReceiveTrueProfileResponse(profileResponse)
  }
}

public class ExpoTruecallerModule: Module {
  private var isInitialized = false
  private let truecallerDelegate = TruecallerDelegateProxy()

  private var expectedNonce: String?
  private var verificationMaterial: [String: Any]?
  private var nonceMismatchDetected = false

  public func definition() -> ModuleDefinition {
    Name("ExpoTruecaller")

    Events("onVerificationResult")

    AsyncFunction("initialize") { (_ options: [String: Any?]?) in
      let appKey = Bundle.main.object(forInfoDictionaryKey: "TruecallerAppKey") as? String ?? ""
      let appLink = Bundle.main.object(forInfoDictionaryKey: "TruecallerAppLink") as? String ?? ""

      guard !appKey.isEmpty, !appLink.isEmpty else {
        return
      }

      let manager = TCTrueSDK.sharedManager()
      manager.setup(withAppKey: appKey, appLink: appLink)
      self.truecallerDelegate.module = self
      manager.delegate = self.truecallerDelegate
      self.isInitialized = true
    }.runOnQueue(.main)

    AsyncFunction("isTruecallerUsable") { () -> Bool in
      self.isInitialized && TCTrueSDK.sharedManager().isSupported()
    }.runOnQueue(.main)

    AsyncFunction("requestVerification") { (_ options: [String: Any?]?) in
      guard self.isInitialized else {
        self.sendEvent("onVerificationResult", [
          "status": "failure",
          "error": "INTERNAL_ERROR",
          "errorMessage": "Truecaller SDK was never initialized - call initialize() first.",
        ])
        return
      }

      let manager = TCTrueSDK.sharedManager()
      guard manager.isSupported() else {
        self.sendEvent("onVerificationResult", [
          "status": "failure",
          "error": "NOT_INSTALLED",
          "errorMessage": "Truecaller app is not installed or otherwise unusable on this device.",
        ])
        return
      }

      if let language = options?["language"] as? String {
        manager.locale = language
      }

      manager.requestTrueProfile()
    }.runOnQueue(.main)

    AsyncFunction("clearCredentials") { () in
      TCTrueSDK.sharedManager().delegate = nil
      self.truecallerDelegate.module = nil
      self.isInitialized = false
    }.runOnQueue(.main)

    OnDestroy {
      TCTrueSDK.sharedManager().delegate = nil
      self.truecallerDelegate.module = nil
      self.isInitialized = false
    }
  }

  fileprivate func handleWillRequestProfile(nonce: String) {
    expectedNonce = nonce
    verificationMaterial = nil
    nonceMismatchDetected = false
  }

  fileprivate func handleDidReceiveTrueProfileResponse(_ response: TCTrueProfileResponse) {
    if let expected = expectedNonce, let received = response.requestNonce, expected != received {
      nonceMismatchDetected = true
      return
    }

    verificationMaterial = [
      "payload": response.payload as Any,
      "signature": response.signature as Any,
      "signatureAlgorithm": response.signatureAlgorithm as Any,
    ]
  }

  fileprivate func handleDidReceive(_ profile: TCTrueProfile) {
    defer {
      expectedNonce = nil
      verificationMaterial = nil
      nonceMismatchDetected = false
    }

    if nonceMismatchDetected {
      sendEvent("onVerificationResult", [
        "status": "failure",
        "error": "UNKNOWN",
        "errorMessage": "Request nonce mismatch - the response didn't match the request this " +
          "module made, so it was rejected as a possible forged/replayed response.",
      ])
      return
    }

    var gender: String?
    switch profile.gender {
    case .male: gender = "male"
    case .female: gender = "female"
    default: gender = nil
    }

    var profileDict: [String: Any] = [
      "firstName": profile.firstName as Any,
      "lastName": profile.lastName as Any,
      "phoneNumber": profile.phoneNumber as Any,
      "countryCode": profile.countryCode as Any,
      "email": profile.email as Any,
      "gender": gender as Any,
      "avatarUrl": profile.avatarURL as Any,
      "city": profile.city as Any,
      "isVerified": profile.isVerified,
    ]

    if let verificationMaterial {
      profileDict["verification"] = verificationMaterial
    }

    sendEvent("onVerificationResult", [
      "status": "success",
      "platform": "ios",
      "profile": profileDict,
    ])
  }

  fileprivate func handleDidFailToReceiveTrueProfile(_ error: TCError) {
    sendEvent("onVerificationResult", [
      "status": "failure",
      "error": mapTcErrorCode(error.code),
      "errorMessage": error.localizedDescription,
    ])
  }
}
