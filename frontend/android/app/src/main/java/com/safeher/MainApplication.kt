package com.safeher

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.safeher.PowerButtonModule // Custom module for power button detection

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
          val packages = PackageList(this).packages.toMutableList()
          // Add custom packages manually
          packages.add(object : ReactPackage {
            override fun createNativeModules(reactContext: com.facebook.react.bridge.ReactApplicationContext): List<com.facebook.react.bridge.NativeModule> {
              return listOf(PowerButtonModule(reactContext))
            }
            override fun createViewManagers(reactContext: com.facebook.react.bridge.ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
              return emptyList()
            }
          })
          // Add react-native-immediate-phone-call package if not auto-linked
          try {
            val immediatePhoneCallPackage = Class.forName("com.rnim.rn.immediatephonecall.RNImmediatePhoneCallPackage").getConstructor().newInstance() as ReactPackage
            packages.add(immediatePhoneCallPackage)
          } catch (e: Exception) {
            println("Warning: RNImmediatePhoneCallPackage not found, ensure react-native-immediate-phone-call is linked")
          }
          return packages
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}