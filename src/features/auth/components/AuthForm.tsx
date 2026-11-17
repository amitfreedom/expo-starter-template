import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Brand } from "@/shared/components/Brand";
import { Button } from "@/shared/components/Button";
import { ErrorText } from "@/shared/components/ErrorText";
import { Field } from "@/shared/components/Field";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
import { useAuthForm } from "../hooks/useAuthForm";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const { c, s, t } = useUI();
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    busy,
    submit,
  } = useAuthForm(signup);
  return (
    <PreferencesPage>
      <View style={s.row}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/splash")}
          hitSlop={12}
        >
          <Text style={s.link}>{t("← Back")}</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 54, marginBottom: 30 }}>
        <Text style={s.eyebrow}>
          {signup ? t("MAKE YOURSELF AT HOME") : t("RIGHT WHERE YOU BELONG")}
        </Text>
        <Text style={s.title}>
          {signup ? t("Your fresh start.") : t("Welcome back.")}
        </Text>
        <Text style={s.subtitle}>
          {signup
            ? t("Create an account and make room for what’s next.")
            : t("Good to see you again. Let’s pick up where you left off.")}
        </Text>
      </View>
      <View style={{ gap: 20 }}>
        {signup && (
          <Field
            label={t("Full name")}
            placeholder={t("Alex Morgan")}
            value={name}
            onChangeText={setName}
            textContentType="name"
            autoComplete="name"
            autoCapitalize="words"
          />
        )}
        <Field
          label={t("Email address")}
          placeholder={t("you@example.com")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          label={t("Password")}
          placeholder={t("At least 8 characters")}
          value={password}
          onChangeText={setPassword}
          password
          autoCapitalize="none"
          autoComplete={signup ? "new-password" : "current-password"}
          textContentType={signup ? "newPassword" : "password"}
          onSubmitEditing={submit}
          returnKeyType="go"
        />
        <ErrorText message={error} />
        <Button
          title={signup ? t("Create account  →") : t("Log in  →")}
          onPress={submit}
          loading={busy}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
          marginVertical: 30,
        }}
      >
        <View style={s.divider} />
        <Text style={{ fontSize: 11, color: c.muted }}>
          {t("A LITTLE NOTE")}
        </Text>
        <View style={s.divider} />
      </View>
      <View style={{ backgroundColor: c.mint, padding: 17, borderRadius: 14 }}>
        <Text style={{ color: c.primary, fontSize: 12, lineHeight: 20 }}>
          {t(
            "You’re exploring a demo. Use any email and an 8-character password, then enter 123456 to continue.",
          )}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 5,
          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 13, color: c.muted }}>
          {signup ? t("Already have an account?") : t("New around here?")}
        </Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.replace(signup ? "/login" : "/signup")}
          style={s.link}
        >
          {signup ? t("Log in") : t("Create an account")}
        </Text>
      </View>
    </PreferencesPage>
  );
}
