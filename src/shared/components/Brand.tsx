import { Text, View } from "react-native";
import { useUI } from "@/shared/theme/useUI";
export function Brand({ light = false }: { light?: boolean }) {
  const { c, s } = useUI();
  return (
    <View style={s.brand}>
      <View style={[s.mark, light && { backgroundColor: c.lime }]}>
        <Text style={[s.markText, light && { color: c.ink }]}>n</Text>
      </View>
      <Text style={[s.brandName, light && { color: c.onPrimary }]}>
        nest<Text style={{ color: light ? c.lime : c.primary }}>.</Text>
      </Text>
    </View>
  );
}
