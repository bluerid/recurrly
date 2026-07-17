import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcominSubscriptionCard from "@/components/UpcominSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/util";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs (HOME_BALANCE.nextRenewalDate).format('MM/DD')}
          </Text>
        </View>
      </View>

      <View>
        <ListHeading title="Upcoming" des="Zero"/>
        <FlatList data={UPCOMING_SUBSCRIPTIONS} renderItem={({ item }) => (
          <UpcominSubscriptionCard { ...item }/>)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
        </FlatList>
      </View>
      <View>
        <ListHeading title="All Subscriptions" des="One" metric={HOME_BALANCE.amount}/>
        <SubscriptionCard {...HOME_SUBSCRIPTIONS[0]}
          expanded={expandedSubscriptionId===HOME_SUBSCRIPTIONS[0].id}
          onPress={ () => setExpandedSubscriptionId((currentId) => currentId === HOME_SUBSCRIPTIONS[0].id ? null : HOME_SUBSCRIPTIONS[0].id) }/>
      </View>
    </SafeAreaView>
  );
}
