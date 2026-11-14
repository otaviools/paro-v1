<!--
  Aviso de privacidade em linguagem simples, aberto numa gaveta a partir de um
  link (referência Tinder). Cada bloco segue uma ADR: sem cadastro (0004), o
  que fica no celular (0003, 0004, 0010, 0015), o que vai ao servidor (0003,
  0004, 0013, 0014) e por quanto tempo (0021). Mudou uma dessas ADRs, muda o texto.
-->
<template>
  <div class="aviso">
    <section class="bloco" aria-labelledby="privacidade-cadastro">
      <h3 id="privacidade-cadastro" class="etiqueta">Sem cadastro</h3>
      <p>
        O Parô não tem conta nem login. Ele nunca pede nome, CPF, telefone, e-mail ou placa do carro.
      </p>
    </section>

    <section class="bloco" aria-labelledby="privacidade-celular">
      <h3 id="privacidade-celular" class="etiqueta">O que fica só no seu celular</h3>
      <ul class="lista">
        <li>A sua rotina, o horário em que você costuma chegar.</li>
        <li>A forma de colaborar que você escolheu.</li>
        <li>O código do seu registro de vaga, que permite mudar a saída prevista e tocar em "Saí". Ele vale só naquela noite.</li>
        <li>O ponto do carro, a posição exata onde você estacionou, para Voltar até o carro.</li>
      </ul>
      <p>
        A localização só é lida com o app aberto, quando você registra a vaga com a localização ligada ou abre
        Voltar até o carro. O Parô não acompanha a sua posição e não lê a localização com o app fechado.
      </p>
      <p>"Apagar histórico", em Ajustes, limpa o que ficou guardado neste celular.</p>
    </section>

    <section class="bloco" aria-labelledby="privacidade-servidor">
      <h3 id="privacidade-servidor" class="etiqueta">O que vai ao servidor</h3>
      <p>
        O registro de vaga leva só a rua coberta e as faixas horárias de chegada e de saída prevista. A sua
        posição exata não vai, e o registro não tem nada que identifique você, nem liga um registro ao outro.
      </p>
      <p>
        Para contar quantas pessoas voltam a usar o Parô, cada visita leva um número sorteado no celular, que
        troca todo mês e não vai junto com os registros de vaga.
      </p>
      <p>
        A resposta a "A previsão ajudou hoje?" leva só o sim ou o não, sem esse número e sem nada que identifique
        você. Só o seu celular guarda que você já respondeu naquela noite.
      </p>
      <p>
        A sugestão de rua, em Ajustes, leva só o texto que você escreve. O servidor guarda esse texto e a data, sem
        nada que identifique você. Não escreva nome, telefone, placa ou outro dado pessoal nela.
      </p>
    </section>

    <section class="bloco" aria-labelledby="privacidade-retencao">
      <h3 id="privacidade-retencao" class="etiqueta">Por quanto tempo</h3>
      <ul class="lista">
        <li>
          Registros de vaga: apagados no fim de cada noite. Fica só o total de registros por rua coberta e faixa
          horária, sem código e sem nada que identifique alguém.
        </li>
        <li>Visitas com o número do mês: guardadas por até 60 dias e depois viram totais por semana, sem o número.</li>
        <li>Sugestões de rua: apagadas pela equipe depois de lidas.</li>
      </ul>
      <p>
        "Apagar histórico" limpa só o celular. Um registro de vaga já enviado fica no servidor até o fim da noite,
        sem como ser ligado a você.
      </p>
    </section>
  </div>
</template>

<style scoped>
.aviso {
  display: grid;
  gap: var(--paro-esp-6);
  font-size: var(--paro-texto-corpo);
}

.bloco {
  display: grid;
  gap: var(--paro-esp-2);
  max-width: 70ch;
}

.etiqueta {
  font-size: var(--paro-texto-etiqueta);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paro-texto-fraco);
}

.lista {
  display: grid;
  gap: var(--paro-esp-1);
  padding-left: var(--paro-esp-5);
  list-style: disc;
}
</style>
