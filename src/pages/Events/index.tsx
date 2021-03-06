import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import avatarImg from '../../assets/avatar.png';

import {
  Container,
  Header,
  WelcomeView,
  WelcomeText,
  UserNameText,
  UserProfile,
  UserAvatar,
  Title,
  EventsList,
  EventContainer,
  EventImage,
  EventData,
  EventType,
  EventName,
  EventFooter,
  EventDate,
  EventDateInfo,
  EventButton,
  EventButtonText,
} from './styles';

export interface IEvent {
  id: string;
  name: string;
  description: string;
  type: string;
  date: string;
  promo_image_url: string;
  state_city: string;
  street: string;
  neighborhood: string;
  number: string;
  CEP: string;
  available_ticket: number;
  owner_id: string;
  formattedDate: string;
}

const Events: React.FC = () => {
  const { signOut, user } = useAuth();
  const { navigate } = useNavigation();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await api.get<IEvent[]>('events');

      const formattedEvents = response.data.map(event => {
        const formattedDate = format(new Date(event.date), 'dd/MM - HH:mm');

        return {
          ...event,
          formattedDate: formattedDate,
        };
      });

      setEvents(formattedEvents);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color="#E13352" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Container>
        <Header>
          <WelcomeView>
            <WelcomeText>Bem-vindo(a)</WelcomeText>
            <UserNameText>{user.name}</UserNameText>
          </WelcomeView>
          <UserProfile onPress={() => navigate('Profile')}>
            <UserAvatar
              source={user.avatar_url ? { uri: user.avatar_url } : avatarImg}
            />
          </UserProfile>
        </Header>
        {events.length > 0 && (
          <EventsList
            data={events}
            keyExtractor={event => event.id}
            ListHeaderComponent={<Title>Eventos</Title>}
            contentContainerStyle={{ marginBottom: 24, height: '100%' }}
            renderItem={({ item: event }) => (
              <EventContainer>
                <EventImage source={{ uri: event.promo_image_url }} />
                <EventData>
                  <EventType>{event.type}</EventType>
                  <EventName>{event.name}</EventName>
                  <EventFooter>
                    <EventDate>
                      <EventDateInfo>{event.state_city}</EventDateInfo>
                      <EventDateInfo style={{ marginTop: 4 }}>
                        {event.formattedDate}
                      </EventDateInfo>
                    </EventDate>
                    <EventButton
                      onPress={() =>
                        navigate('Details', {
                          event_id: event.id,
                        })
                      }
                    >
                      <EventButtonText>Ver mais</EventButtonText>
                    </EventButton>
                  </EventFooter>
                </EventData>
              </EventContainer>
            )}
          />
        )}
      </Container>
    </SafeAreaView>
  );
};

export default Events;
