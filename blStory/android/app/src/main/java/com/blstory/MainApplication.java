package com.blstory;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.reactnativecomponent.splashscreen.RCTSplashScreenPackage;    //import package

import com.rnfs.RNFSPackage;
import com.parryworld.rnappupdate.RNAppUpdatePackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.microsoft.codepush.react.CodePush;
import com.theweflex.react.WeChatPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.umeng.analytics.MobclickAgent;
import com.umeng.analytics.MobclickAgent.EScenarioType;
import com.blstory.umeng.DplusReactPackage;
import com.blstory.umeng.RNUMConfigure;
import com.umeng.commonsdk.UMConfigure;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RCTSplashScreenPackage(),

            new RNFSPackage(),
            new RNAppUpdatePackage(),
            new LinearGradientPackage(),
            new RNDeviceInfo(),
            new DplusReactPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new WeChatPackage()

      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
      super.onCreate();
      SoLoader.init(this, /* native exopackage */ false);

      // UMeng: 通过该方法设置组件化的Log是否输出，默认关闭Log输出
      UMConfigure.setLogEnabled(true);

      //设置统计的场景，以及发送间隔
      MobclickAgent.setSessionContinueMillis(1000);
      MobclickAgent.setScenarioType(this, EScenarioType.E_DUM_NORMAL);

      // RN UMeng初始化
      RNUMConfigure.init(this, "", "", UMConfigure.DEVICE_TYPE_PHONE,"");
  }
}
