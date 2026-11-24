---
title: Parô
description: Documentação do Parô, o app que mostra a chance de encontrar vaga por rua e horário no entorno da ESAMC Uberlândia.
---

::u-page-hero{class="capa"}
---
orientation: vertical
---
#title
A chance de achar [vaga]{.text-primary} antes de sair de casa.

#description
O Parô mostra a chance de encontrar vaga de estacionamento por rua e faixa horária no entorno da ESAMC Uberlândia. Esta documentação explica como a chance é calculada, o que o app guarda e como rodar o projeto.

#links
  :::u-button
  ---
  to: /comecando/o-que-e-o-paro
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Começar
  :::

  :::u-button
  ---
  to: https://paro-v1.vercel.app
  target: _blank
  color: neutral
  variant: outline
  size: xl
  icon: i-lucide-smartphone
  ---
  Abrir o app
  :::

#default
  :::print-do-desktop
  ---
  nome: desktop-inicio
  alt: "Desktop: barra lateral com o Início, o link do GitHub e o mapa da área com a legenda"
  ---
  :::
::

::u-page-section
---
title: O que tem aqui
description: Do cálculo da chance à arquitetura do app.
---
#features
  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-percent
  title: Como a chance é calculada
  description: Observações de campo, rua cheia a partir de 85% e as três faixas de chance.
  to: /produto/como-a-chance-e-calculada
  ---
  :::

  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-smartphone
  title: Telas
  description: Início, Mapa, Detalhe da rua, Vaga, Ajustes e Área da equipe.
  to: /produto/telas
  ---
  :::

  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-shield-check
  title: Dados e privacidade
  description: Sem cadastro, registros apagados toda noite e tiles de mapa próprios.
  to: /produto/dados-e-privacidade
  ---
  :::

  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-terminal
  title: Rodar localmente
  description: Instalar, subir o servidor e testar a noite com o relógio falso.
  to: /comecando/rodar-localmente
  ---
  :::

  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-boxes
  title: Arquitetura e módulos
  description: Módulos do servidor e do celular, contratos da API e estado compartilhado.
  to: /tecnico/arquitetura-e-modulos
  ---
  :::

  :::u-page-card
  ---
  spotlight: true
  icon: i-lucide-palette
  title: Design system
  description: Paleta Papel, raios, vidro e componentes base.
  to: /tecnico/design-system
  ---
  :::
::
