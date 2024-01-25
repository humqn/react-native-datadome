package com.datadome.reactnativedatadome;

import androidx.annotation.NonNull;
import android.content.Context;
import android.util.Log;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.WindowManager;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = ReactNativeDatadomeModule.NAME)
public class ReactNativeDatadomeModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ReactNativeDatadome";
  protected Context context;

  public ReactNativeDatadomeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.context = reactContext.getBaseContext();
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void setDataDomeCookie(String value) {
  }

  @ReactMethod
  public void appVersion(final Promise promise) {
      try {
          PackageInfo pInfo = this.context.getPackageManager().getPackageInfo(this.context.getPackageName(), 0);
          promise.resolve(pInfo.versionName);
      } catch (PackageManager.NameNotFoundException e) {
          promise.reject("Can't get the app version", e);
      }
  }

  
  @ReactMethod
  public void systemVersion(final Promise promise) {
      Log.d("[Native]", "Looking for system version");
      promise.resolve("" + android.os.Build.VERSION.SDK_INT);
  }


  @ReactMethod
  public void systemName(final Promise promise) {
      promise.resolve("Android " + android.os.Build.VERSION.SDK_INT);
  }

  @ReactMethod
  public void systemShortVersion(final Promise promise) {
      promise.resolve("" + android.os.Build.VERSION.SDK_INT);
  }

  @ReactMethod
  public void deviceModel(final Promise promise) {
     promise.resolve(android.os.Build.MODEL);
  }

  @ReactMethod
  public void deviceScreenWidth(final Promise promise) {
      WindowManager wm = (WindowManager) this.context.getSystemService(Context.WINDOW_SERVICE);
      Display display = wm.getDefaultDisplay();
      DisplayMetrics metrics = new DisplayMetrics();
      display.getMetrics(metrics);
      promise.resolve("" + metrics.widthPixels);

  }

  @ReactMethod
  public void deviceScreenHeight(final Promise promise) {
      WindowManager wm = (WindowManager) this.context.getSystemService(Context.WINDOW_SERVICE);
      Display display = wm.getDefaultDisplay();
      DisplayMetrics metrics = new DisplayMetrics();
      display.getMetrics(metrics);
      promise.resolve("" + metrics.heightPixels);
  }

  @ReactMethod
  public void deviceScreenScale(final Promise promise) {
      WindowManager wm = (WindowManager) this.context.getSystemService(Context.WINDOW_SERVICE);
      Display display = wm.getDefaultDisplay();
      DisplayMetrics metrics = new DisplayMetrics();
      display.getMetrics(metrics);
      promise.resolve("" + metrics.density);
  }
}
