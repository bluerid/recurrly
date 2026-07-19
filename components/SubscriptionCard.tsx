import { formatCurrency, formatSubscriptionDateTime } from '@/lib/util'
import clsx from 'clsx'
import { Image, Pressable, Text, View } from 'react-native'

const SubscriptionCard = ({ name, price, icon, currency, billing, renewalDate, color, category, plan, onPress, paymentMethod, expanded }: SubscriptionCardProps) => {
  return (
    <Pressable className={ clsx( 'sub-card', expanded ? 'sub-card-expanded' : 'bg-card' )} 
    onPress={onPress} style={ !expanded && color? { backgroundColor: color } : undefined }>
      <View className='sub-head'>
        <View className='sub-main'>
          <Image source={icon} className='sub-icon'/>
          <View className='sub-copy'>
            <Text numberOfLines={1} className='sub-title'>{name}</Text>
            <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>
              {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '') }
            </Text>
          </View>
        </View>
        <View className='sub-price-box'>
          <Text className='sub-price'>{ formatCurrency(price, currency) }</Text>
          <Text className='sub-billing'>{billing}</Text>
        </View>
      </View>

      
      {expanded && (
        <View className='sub-body'>
          <View className='sub-details'>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Payment:</Text>
                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim()}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default SubscriptionCard