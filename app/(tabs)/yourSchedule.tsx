import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function Example() {
  const swiper = useRef();
  const contentSwiper = useRef();
  const [week, setWeek] = useState(0);

  const [value, setValue] = useState(new Date());

  /**
   * Create an array of weekdays for previous, current, and next weeks.
   */
  const weeks = React.useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');

    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');

        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  /**
   * Create an array of days for yesterday, today, and tomorrow.
   */
  const days = React.useMemo(() => {
    return [
      moment(value).subtract(1, 'day').toDate(),
      value,
      moment(value).add(1, 'day').toDate(),
    ];
  }, [value]);

  //Flatlist Section Starts


  /// Add asynchronous Data as discussed. - Rishabh
  const transactions = [
    { id: '1', name: 'Gas ',   amount: 64.40, iconName: 'fuel', color: '#FFA07A' },
    { id: '2', name: 'Petco',  amount: 120.49, iconName: 'paw', color: '#CCCCFF' },
    { id: '3', name: 'Target', amount: 254.12, iconName: 'cart', color: '#FFA07A' },
    { id: '4', name: 'United', amount: 1943.00, iconName: 'book', color: '#CCCCFF' },
    { id: '5', name: 'Starbucks', amount: 3.85, iconName: 'coffee', color: '#CCCCFF' },
    { id: '6', name: 'AMC',    amount: 12.55, iconName: 'film', color: '#FFA07A' },
    { id: '7', name: 'Gas ',   amount: 64.40, iconName: 'fuel', color: '#FFA07A' },
    { id: '8', name: 'Petco',  amount: 120.49, iconName: 'paw', color: '#CCCCFF' },
    { id: '9', name: 'Target', amount: 254.12, iconName: 'cart', color: '#FFA07A' },
  ];

  // Icon component placeholder (you'll need to use actual icons from your icon library)
  const Icon = ({ name, color }) => (
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      {/* Replace this with your actual icon component */}
      <Text style={styles.iconPlaceholder}>{name[0]}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.leftContent}>
        <Icon name={item.iconName} color={item.color} />
        <View style={styles.textContainer}>
          <Text style={styles.merchantName}>{item.name}</Text>
        </View>
      </View>
      <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
    </View>
  );


  //Flatlist Section Ends

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={ind => {
              if (ind === 1) {
                return;
              }

              const index = ind - 1;
              setValue(moment(value).add(index, 'week').toDate());

              setTimeout(() => {
                setWeek(week + index);
                swiper.current.scrollTo(1, false);
              }, 10);
            }}>
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive =
                    value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}>
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#2b64e3',
                            borderColor: '#2b64e3',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        <Swiper
          index={1}
          ref={contentSwiper}
          loop={false}
          showsPagination={false}
          onIndexChanged={ind => {
            if (ind === 1) {
              return;
            }

            setTimeout(() => {
              const nextValue = moment(value).add(ind - 1, 'days');

              // Adjust week picker if needed
              if (moment(value).week() !== nextValue.week()) {
                setWeek(
                  moment(value).isBefore(nextValue) ? week + 1 : week - 1,
                );
              }

              setValue(nextValue.toDate());
              contentSwiper.current.scrollTo(1, false);
            }, 10);
          }}>
          {days.map((day, index) => {
            return (
              <View
                key={index}
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
                <Text style={styles.subtitle}>
                  {day.toLocaleDateString('en-US', { dateStyle: 'full' })}
                </Text>
                <View style={styles.placeholder}>
                  <View style={styles.placeholderInset}>
                    {
                      <FlatList
                        data={transactions}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                      />
                    }
                  </View>
                </View>
              </View>
            );
          })}
        </Swiper>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.btn}>
              <MaterialCommunityIcons
                color="#fff"
                name="arrow-left"
                size={22}
                style={{ marginRight: 6 }} />

              <Text style={styles.btnText}>Go Back to Dashboard</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
  /** Item */
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },

  //Flatlist Component Code Start
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 12,
    marginVertical: 3,
  },
  iconPlaceholder: {
    fontSize: 16,
    color: '#000',
  },
  textContainer: {
    justifyContent: 'center',
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22AA44',
    marginRight:20,
  },
});