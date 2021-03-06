import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCode from 'react-native-qrcode-svg';

import api from '../../services/api';
import ticketImg from '../../assets/ticket.png';
import { IEvent } from '../Events/index';

import {
  Container,
  PromoImage,
  EventDetailsContainer,
  EventBasicData,
  EventName,
  EventDateContainer,
  EventDateContent,
  EventCity,
  EventAddress,
  EventDate,
  EventPriceContainer,
  EventPriceLabel,
  EventPrice,
  EventTickets,
  TicketContainer,
  TicketImage,
  TicketContent,
  TicketInfo,
  TicketPrice,
  EventAnotherData,
  EventDescription,
  QrCodeContainer,
  EventDateShow,
  EventDateShowWeekDay,
  EventDateShowDay,
  EventDateShowMonth,
} from './styles';
import formatValue from '../../utils/formatValue';
import Button from '../../components/Button';

interface RouteParams {
  event_id: string;
}

export interface ITicket {
  id: string;
  info: string;
  price: number;
  event_id: string;
}

interface IEventDetail extends IEvent {
  tickets: ITicket[];
  lower_price: string;
  bigger_price: string;
}

const Details: React.FC = () => {
  const [event, setEvent] = useState<IEventDetail>({} as IEventDetail);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ITicket>({} as ITicket);
  const { navigate } = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  useEffect(() => {
    (async () => {
      const response = await api.get<IEventDetail>(
        `/events/details/${params.event_id}`,
      );
      Image.prefetch(response.data.promo_image_url);

      const formattedEvent = {
        ...response.data,
        formattedDate: format(
          new Date(response.data.date),
          "' 'dd 'de' MMMM' de ' yyyy', ' HH:mm' '",
          {
            locale: ptBR,
          },
        ),
      };

      const ticketPrices = formattedEvent.tickets.map(ticket => {
        return ticket.price;
      });

      const formattedEventPrices = {
        ...formattedEvent,
        lower_price: formatValue(Math.min.apply(null, ticketPrices)),
        bigger_price: formatValue(Math.max.apply(null, ticketPrices)),
      };

      setEvent(formattedEventPrices);
      setSelectedTicket(formattedEventPrices.tickets[0]);
      setIsLoading(false);
    })();
  }, [params]);

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
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Container>
        <PromoImage
          source={{ uri: event.promo_image_url }}
          resizeMode="cover"
        />
        <EventDateShow>
          <EventDateShowWeekDay>
            {format(new Date(event.date), 'EEEE', { locale: ptBR }).substring(
              0,
              3,
            )}
          </EventDateShowWeekDay>
          <EventDateShowDay>
            {format(new Date(event.date), 'dd', { locale: ptBR })}
          </EventDateShowDay>
          <EventDateShowMonth>
            {format(new Date(event.date), 'MMMM', { locale: ptBR }).substring(
              0,
              3,
            )}
          </EventDateShowMonth>
        </EventDateShow>
        <EventDetailsContainer>
          <EventBasicData>
            <EventName>{event.name}</EventName>
            <EventDateContainer>
              <Icon name="map-pin" size={24} color="#E13352" />
              <EventDateContent>
                <EventCity>{event.state_city}</EventCity>
                <EventAddress>{`${event.street} - ${event.neighborhood}, ${event.number}`}</EventAddress>
                <EventDate>{event.formattedDate}</EventDate>
              </EventDateContent>
            </EventDateContainer>
          </EventBasicData>
          <EventPriceContainer>
            <EventPriceLabel>Ingressos</EventPriceLabel>
            <EventPrice>{`${event.lower_price} - ${event.bigger_price}`}</EventPrice>
          </EventPriceContainer>
          <EventTickets
            data={event.tickets}
            keyExtractor={ticket => ticket.id}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={({ item: ticket, index }) => (
              <TicketContainer
                style={index === 0 && { marginLeft: 0 }}
                onPress={() => setSelectedTicket(ticket)}
                selected={ticket.id === selectedTicket.id}
              >
                <TicketImage source={ticketImg} />
                <TicketContent>
                  <TicketInfo>{ticket.info}</TicketInfo>
                  <TicketPrice>{formatValue(ticket.price)}</TicketPrice>
                </TicketContent>
              </TicketContainer>
            )}
          />
          <EventAnotherData>
            <EventDescription>{event.description}</EventDescription>
            <QrCodeContainer>
              <QRCode size={200} value={event.id} />
            </QrCodeContainer>
            <Button
              onPress={() =>
                navigate('Payment', {
                  ticket: selectedTicket,
                  event,
                })
              }
            >
              {`Comprar ingresso - ${formatValue(selectedTicket.price)}`}
            </Button>
          </EventAnotherData>
        </EventDetailsContainer>
      </Container>
    </ScrollView>
  );
};

export default Details;
