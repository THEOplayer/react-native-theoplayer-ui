package com.example.cast

import android.content.Context
import com.google.android.gms.cast.framework.CastOptions
import com.google.android.gms.cast.framework.OptionsProvider
import com.google.android.gms.cast.framework.SessionProvider

class CastOptionsProvider : OptionsProvider {
    override fun getCastOptions(context: Context): CastOptions {
        return CastOptions.Builder()
            .setReceiverApplicationId(DEFAULT_APP_ID)
            .build()
    }

    override fun getAdditionalSessionProviders(context: Context): MutableList<SessionProvider?>? {
        return null
    }

    companion object {
        var DEFAULT_APP_ID: String = "CC1AD845"
    }
}
