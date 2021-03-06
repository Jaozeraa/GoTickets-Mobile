import React, { useRef, useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { FormHandles } from '@unform/core';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';

import Button from '../../components/Button';
import Input from '../../components/Input';
import {
  Container,
  TitleView,
  Title,
  Form,
  GoBackButton,
  GoBackText,
} from './styles';

import logoImg from '../../assets/logo.png';
import getValidationErrors from '../../utils/getValidationErrors';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const { goBack } = useNavigation();
  const formRef = useRef<FormHandles>(null);
  const { logIn } = useAuth();
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      try {
        setButtonIsLoading(true);
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório'),
          email: Yup.string()
            .required('E-mail é obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string()
            .required('Senha é obrigatória')
            .min(5, 'Senha curta demais'),
        });

        await schema.validate(data, { abortEarly: false });

        await api.post('/users', data);

        Alert.alert(
          'Conta criada com sucesso!',
          'Você já pode entrar na sua conta e curtir',
        );

        goBack();
      } catch (err) {
        setButtonIsLoading(false);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        if (err.response.data?.message === 'This email is already taken.') {
          return Alert.alert(
            'E-mail em uso',
            'Este e-mail já está em uso! Escolha outro',
          );
        }

        Alert.alert(
          'Erro ao criar conta',
          'Ocorreu um erro ao criar sua conta. Tente novamente.',
        );
      }
    },
    [logIn, goBack],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <Container>
          <Image source={logoImg} />
          <TitleView>
            <Title>Crie sua conta</Title>
          </TitleView>

          <Form ref={formRef} onSubmit={handleSubmit}>
            <Input
              label="Nome completo"
              name="name"
              placeholder="Digite seu nome"
              autoCorrect={false}
            />
            <Input
              label="E-mail"
              name="email"
              placeholder="Digite seu e-mail"
              autoCorrect={false}
              autoCapitalize="none"
              containerStyle={{ marginTop: 16 }}
              keyboardType="email-address"
            />

            <Input
              label="Senha"
              name="password"
              placeholder="Digite sua senha"
              containerStyle={{ marginTop: 16 }}
              secureTextEntry
            />

            <Button
              enabled={!buttonIsLoading}
              onPress={() => formRef.current?.submitForm()}
            >
              Cadastrar
            </Button>
          </Form>
          <GoBackButton onPress={() => goBack()}>
            <GoBackText>Voltar para o Login</GoBackText>
          </GoBackButton>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
