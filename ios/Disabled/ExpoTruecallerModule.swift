import ExpoModulesCore

public class ExpoTruecallerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTruecaller")

    Events("onVerificationResult")

    AsyncFunction("initialize") { (_ options: [String: Any?]?) in
      // No-op
    }

    AsyncFunction("isTruecallerUsable") { () -> Bool in
      false
    }

    AsyncFunction("requestVerification") { (_ options: [String: Any?]?) in
      self.sendEvent("onVerificationResult", [
        "status": "failure",
        "error": "INTERNAL_ERROR",
        "errorMessage": "Truecaller isn't configured for iOS on this app (no iosAppKey/" +
          "iosAppLink in the expo-truecaller config plugin) - TrueSDK wasn't bundled into this build.",
      ])
    }

    AsyncFunction("clearCredentials") { () in
      // No-op
    }
  }
}
