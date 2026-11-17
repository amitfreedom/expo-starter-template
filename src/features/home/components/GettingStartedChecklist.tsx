import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUI } from "@/shared/theme/useUI";
import { useState } from "react";
export function GettingStartedChecklist() {
  const { c, s, t } = useUI();
  const [explored, setExplored] = useState(false);
  return (
    <View style={{ marginTop: 28, gap: 15 }}>
      <View style={s.row}>
        <Text style={s.sectionTitle}>{t("A good beginning")}</Text>
        <Text style={{ fontSize: 11, color: c.muted }}>
          {t("{count} of {total}", { count: explored ? 3 : 2, total: 3 })}
        </Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: c.border }}>
        <View
          style={{
            width: explored ? "100%" : "66.7%",
            height: 5,
            backgroundColor: c.primary,
            borderRadius: 3,
          }}
        />
      </View>
      {[
        { title: t("Create your account"), done: true },
        { title: t("Verify your email"), done: true },
        { title: t("Explore your new space"), done: explored },
      ].map((item, i) => (
        <View
          key={item.title}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 5,
          }}
        >
          <Feather
            name={item.done ? "check-circle" : "circle"}
            size={19}
            color={item.done ? c.primary : c.muted}
          />
          <Text
            style={{
              fontSize: 13,
              color: item.done ? c.muted : c.ink,
              flex: 1,
            }}
          >
            {item.title}
          </Text>
          {i === 2 && !explored && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExplored(true)}
              hitSlop={10}
            >
              <Text style={s.link}>{t("Done")}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
