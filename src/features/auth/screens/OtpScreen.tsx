import { Redirect, router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Brand } from "@/shared/components/Brand";
import { Button } from "@/shared/components/Button";
import { ErrorText } from "@/shared/components/ErrorText";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
import { useOtpVerification } from "../hooks/useOtpVerification";
export default function OtpScreen() {
  const { c, s, t, resolvedTheme } = useUI();
  const {
    user,
    challenge,
    code,
    setCode,
    error,
    busy,
    cooldown,
    input,
    submit,
    resend,
  } = useOtpVerification();
  if (user) return null;
  if (!challenge) return <Redirect href="/login" />;
  return (
    <PreferencesPage>
      <Brand />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={{ marginTop: 35, alignSelf: "flex-start" }}
      >
        <Text style={s.link}>{t("← Back")}</Text>
      </Pressable>
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 25,
          backgroundColor: c.mint,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 36,
          marginBottom: 30,
        }}
      >
        <Text style={{ fontSize: 32, color: c.primary }}>✉</Text>
      </View>
      <Text style={s.eyebrow}>{t("ONE LAST LITTLE STEP")}</Text>
      <Text style={s.title}>{t("Check your inbox.")}</Text>
      <Text style={s.subtitle}>
        {t("Enter the 6-digit verification code for")}
        {"\n"}
        <Text style={{ color: c.ink, fontWeight: "600" }}>
          {challenge.user.email}
        </Text>
      </Text>
      <View style={{ marginTop: 35, gap: 20 }}>
        <Text style={s.label}>{t("Verification code")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Enter verification code")}
          onPress={() => input.current?.focus()}
          style={{ position: "relative" }}
        >
          <View pointerEvents="none" style={{ flexDirection: "row", gap: 7 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 59,
                  borderWidth: 1,
                  borderColor: code.length === i ? c.primary : c.border,
                  borderRadius: 12,
                  backgroundColor: c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 23, color: c.ink, fontWeight: "600" }}>
                  {code[i] || "·"}
                </Text>
              </View>
            ))}
          </View>
          <TextInput
            ref={input}
            accessibilityLabel={t("Six digit verification code")}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            keyboardAppearance={resolvedTheme}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            caretHidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.02,
              color: "transparent",
            }}
            onSubmitEditing={submit}
          />
        </Pressable>
        <ErrorText message={error} />
        <Button
          title={t("Verify & continue  →")}
          onPress={submit}
          disabled={code.length !== 6}
          loading={busy}
        />
      </View>
      <View style={{ alignItems: "center", gap: 12, marginTop: 27 }}>
        <Text style={{ color: c.muted, fontSize: 13 }}>
          {t("Didn’t receive your code?")}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={cooldown > 0 || busy}
          onPress={resend}
        >
          <Text style={[s.link, cooldown > 0 && { color: c.muted }]}>
            {cooldown > 0
              ? t("Resend code in {seconds}s", { seconds: cooldown })
              : t("Resend code")}
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          s.card,
          { backgroundColor: c.mint, marginTop: 40, borderWidth: 0 },
        ]}
      >
        <Text style={{ fontSize: 12, color: c.primary, lineHeight: 20 }}>
          {t("Demo verification code: 123456")}
          {"\n"}
          {t("No email is sent. Your code expires in 5 minutes.")}
        </Text>
      </View>
    </PreferencesPage>
  );
}
