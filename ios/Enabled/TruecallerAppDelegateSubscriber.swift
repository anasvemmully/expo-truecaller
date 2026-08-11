import ExpoModulesCore
import TrueSDK

public class TruecallerAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let truecallerRestorationHandler: ([Any]?) -> Void = { restorableObjects in
      let mappedObjects = restorableObjects?.compactMap {
        $0 as? UIUserActivityRestoring
      }
      restorationHandler(mappedObjects)
    }

    return TCTrueSDK.sharedManager().application(
      application,
      continue: userActivity,
      restorationHandler: truecallerRestorationHandler
    )
  }

  public func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return TCTrueSDK.sharedManager().continue(withUrlScheme: url)
  }
}
