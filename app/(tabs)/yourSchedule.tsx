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
  const [totalCalories, setTotalCalories] = useState(0);

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

  useEffect(() => {
    if (todayItems.length > 0) {
      const total = todayItems.reduce((sum, item) => sum + item.calories, 0);
      setTotalCalories(total);
    } else {
      setTotalCalories(0);
    }
  }, [todayItems]);

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

  const renderFoodItem = ({ item }: { item: TodayItem }) => (
    <TouchableOpacity 
      style={styles.transactionItem} 
      activeOpacity={0.7}>
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
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.totalCaloriesCard}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF5722" />
        <Text style={styles.totalCaloriesText}>
          {totalCalories}
          <Text style={styles.totalCaloriesUnit}> kcal</Text>
        </Text>
        <Text style={styles.totalCaloriesLabel}>Total Calories Today</Text>
      </View>
    </View>
  );

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

  const days = React.useMemo(() => {
    return [
      moment(value).subtract(1, 'day').toDate(),
      value,
      moment(value).add(1, 'day').toDate(),
    ];
  }, [value]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
              if (ind === 1) return;
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
                  const isActive = value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}>
                      <View style={[styles.item, isActive && styles.activeItem]}>
                        <Text style={[styles.itemWeekday, isActive && styles.activeText]}>
                          {item.weekday}
                        </Text>
                        <Text style={[styles.itemDate, isActive && styles.activeText]}>
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
            if (ind === 1) return;
            setTimeout(() => {
              const nextValue = moment(value).add(ind - 1, 'days');
              if (moment(value).week() !== nextValue.week()) {
                setWeek(moment(value).isBefore(nextValue) ? week + 1 : week - 1);
              }
              setValue(nextValue.toDate());
              contentSwiper.current.scrollTo(1, false);
            }, 10);
          }}>
          {days.map((day, index) => {
            const isToday = moment(day).isSame(moment(), 'day');
            return (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dateHeader}>
                  {day.toLocaleDateString('en-US', { dateStyle: 'full' })}
                </Text>
                <View style={styles.contentCard}>
                  {isToday ? (
                    <>
                      {renderHeader()}
                      <FlatList
                        data={todayItems}
                        renderItem={renderFoodItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={() => (
                          <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="food-apple" size={48} color="#e0e0e0" />
                            <Text style={styles.emptyText}>No food items recorded today</Text>
                          </View>
                        )}
                      />
                    </>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <MaterialCommunityIcons name="calendar" size={48} color="#e0e0e0" />
                      <Text style={styles.emptyText}>No records for this day</Text>
                    </View>
                  )}
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
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  picker: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  item: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 45,
  },
  activeItem: {
    backgroundColor: '#075eec',
    elevation: 4,
    shadowColor: '#075eec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  activeText: {
    color: '#fff',
  },
  dayContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginVertical: 16,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalCaloriesCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff5f2',
    borderRadius: 12,
  },
  totalCaloriesText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1d',
    marginTop: 8,
  },
  totalCaloriesUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalCaloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
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
});