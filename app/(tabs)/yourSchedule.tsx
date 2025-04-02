import React, { useState, useRef, useEffect } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface TodayItem {
  id: string;
  name: string;
  calories: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export default function YourSchedule() {
  const swiper = useRef();
  const contentSwiper = useRef();
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());
  const [todayItems, setTodayItems] = useState<TodayItem[]>([]);

  // Load today's items whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodayItems();
      
      // Set up an interval to refresh data every few seconds
      const interval = setInterval(loadTodayItems, 3000);
      
      // Clean up interval on unfocus
      return () => clearInterval(interval);
    }, [])
  );

  const loadTodayItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('todayItems');
      if (savedItems) {
        const items = JSON.parse(savedItems);
        setTodayItems(items);
      }
    } catch (error) {
      console.error('Error loading today items:', error);
    }
  };

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

  const renderFoodItem = ({ item }: { item: TodayItem }) => (
    <View style={styles.transactionItem}>
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameCalorieRow}>
            <Text style={styles.merchantName}>{item.name}</Text>
            <Text style={styles.calorieText}>{item.calories} kcal</Text>
          </View>
        </View>
      </View>
    </View>
  );

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
            const isToday = moment(day).isSame(moment(), 'day');
            return (
              <View
                key={index}
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
                <Text style={styles.subtitle}>
                  {day.toLocaleDateString('en-US', { dateStyle: 'full' })}
                </Text>
                <View style={styles.placeholder}>
                  <View style={styles.placeholderInset}>
                    {isToday ? (
                      <FlatList
                        data={todayItems}
                        renderItem={renderFoodItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                          <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="food-apple" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No food items recorded today</Text>
                          </View>
                        )}
                      />
                    ) : (
                      <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="calendar" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No records for this day</Text>
                      </View>
                    )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameCalorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1d',
  },
  calorieText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});