import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedView } from '@/shared/components/layout';
import { Text } from '@/shared/components/ui';
import { Calendar as RNCalendar } from 'react-native-calendars';
import MainScreenWrapper from '@/shared/components/layout/MainScreenWrapper';

export default function Calendar() {
  const [selected, setSelected] = useState('');

  // Sample events with different statuses
  const events = [
    {
      date: '2025-09-28',
      title: 'Car Maintenance',
      time: '9:00 AM',
      status: 'upcoming',
      description: 'Oil change and tire rotation',
    },
    {
      date: '2024-12-21',
      title: 'Insurance Renewal',
      time: '11:00 AM',
      status: 'completed',
      description: 'Renewed car insurance policy',
    },
    {
      date: '2025-09-18',
      title: 'Vehicle Inspection',
      time: '2:00 PM',
      status: 'overdue',
      description: 'Annual vehicle safety inspection',
    },
    {
      date: '2025-09-30',
      title: 'Fuel Check',
      time: '10:00 AM',
      status: 'upcoming',
      description: 'Check fuel efficiency and consumption',
    },
    {
      date: '2025-09-25',
      title: 'Service Appointment',
      time: '2:00 PM',
      status: 'completed',
      description: 'Regular maintenance service completed',
    },
    {
      date: '2025-09-20',
      title: 'Registration Renewal',
      time: '3:00 PM',
      status: 'overdue',
      description: 'Vehicle registration needs to be renewed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#999999'; // Gray
      case 'completed':
        return '#4682c2'; // Primary blue
      case 'overdue':
        return '#FF193B'; // Red
      default:
        return '#4682c2';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  // Create marked dates with different colors based on status
  const markedDates = events.reduce((acc, event) => {
    const color = getStatusColor(event.status);
    acc[event.date] = {
      marked: true,
      dotColor: color,
      selectedColor: color,
      // Add light background color shadow
      customStyles: {
        container: {
          backgroundColor: `${color}15`, // Very light version of the status color
          borderRadius: 16,
        },
        text: {
          color: '#2d4150',
          fontWeight: '400',
        },
      },
    };
    return acc;
  }, {} as any);

  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      selectedColor: markedDates[selected]?.dotColor || '#4682c2',
      // Remove the light background when selected
      customStyles: {
        container: {
          backgroundColor: markedDates[selected]?.dotColor || '#4682c2',
          borderRadius: 16,
        },
        text: {
          color: '#ffffff',
          fontWeight: '500',
        },
      },
    };
  }
  return (
    <MainScreenWrapper isScrollable>
      <View style={styles.header}>
        <Text style={styles.title} size={24} weight={700}>
          Calendar
        </Text>
        <Text style={styles.subtitle} size={16} weight={400}>
          Your schedule and appointments
        </Text>
      </View>
      {/* Color Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#999999' }]} />
            <Text style={styles.legendText} size={12}>
              Upcoming
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4682c2' }]} />
            <Text style={styles.legendText} size={12}>
              Completed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF193B' }]} />
            <Text style={styles.legendText} size={12}>
              Overdue
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <RNCalendar
          style={styles.calendar}
          onDayPress={(day: any) => {
            if (day.dateString == selected) setSelected('');
            else setSelected(day.dateString);
          }}
          markedDates={markedDates}
          markingType={'custom'}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#4682c2',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#4682c2',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            arrowColor: '#4682c2',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#4682c2',
            indicatorColor: '#4682c2',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
        />

        <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.eventsTitle} size={18} weight={600}>
            {selected ? `Events for ${selected}` : 'Upcoming Events'}
          </Text>

          {events
            .filter((event) => (selected ? event.date === selected : event.status === 'upcoming'))
            .map((event, index) => (
              <View
                key={index}
                style={[styles.eventItem, { borderLeftColor: getStatusColor(event.status) }]}
              >
                <View
                  style={[styles.eventDot, { backgroundColor: getStatusColor(event.status) }]}
                />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle} size={16} weight={500}>
                      {event.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(event.status)}15` },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(event.status) }]}
                        size={12}
                        weight={600}
                      >
                        {getStatusText(event.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventTime} size={14}>
                    {event.time} • {event.date}
                  </Text>
                  <Text style={styles.eventDescription} size={13}>
                    {event.description}
                  </Text>
                </View>
              </View>
            ))}

          {selected && events.filter((event) => event.date === selected).length === 0 && (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No events for this date</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </MainScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  calendarContainer: {
    flex: 1,
  },
  calendar: {
    marginBottom: 20,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  eventsTitle: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4682c2',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4682c2',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    flex: 1,
  },
  eventTime: {
    opacity: 0.7,
    marginBottom: 6,
  },
  eventDescription: {
    opacity: 0.8,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noEvents: {
    padding: 20,
    alignItems: 'center',
  },
  noEventsText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  legendContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 10,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    opacity: 0.8,
  },
});
