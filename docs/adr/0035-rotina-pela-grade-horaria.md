# Rotina pela grade horária, lida do PDF no celular

A rotina era um horário de chegada só, escolhido em Ajustes (ADR 0015). Quem estuda na ESAMC tem aulas em horários diferentes em cada dia da semana, e a hora em que a aula acaba já diz quando a vaga deve ficar livre. Decidimos que a pessoa pode importar a **grade horária** do portal da ESAMC em PDF:

- **Leitura no celular:** o pdf.js lê o PDF no navegador. O PDF não vai ao servidor e não é guardado. Do arquivo, o app guarda só o início da primeira aula e o fim da última de cada dia da semana; nome, matrícula, documentos, disciplinas e professores são ignorados. A grade fica no celular, com a rotina (ADR 0004), e "Apagar histórico" a apaga.
- **Só aulas da noite:** entram as aulas que começam das 17h às 23h. Dias só com aulas fora desse período ficam sem aula.
- **Conferência:** depois da leitura, a pessoa confere e pode corrigir cada dia antes de salvar. Se o PDF não tem texto ("Microsoft Print to PDF" desenha as letras), o app explica como salvar pelo Chrome e oferece preencher a mesma lista à mão.
- **Melhor chegada:** em cada dia com aula, a faixa horária e a rua coberta de maior chance entre as que ainda dão tempo de andar até a aula (a 80 m por minuto, a partir do início da faixa horária). No empate, a faixa horária mais tarde e depois a rua mais perto. É calculada no servidor a cada consulta, então acompanha as observações.
- **Saída prevista:** a faixa horária em que a última aula do dia acaba (aula até 21h50, saída 21h30). Registrar vaga já vem com ela.
- **Substitui a rotina:** com grade, o Início abre na melhor chegada do dia e mostra o card "Hoje" até o registro de vaga ou o início da primeira aula. Em dia sem aula, abre em Agora. Remover a grade volta ao horário único.

## Considered Options

- **Escolher, para cada dia, até que horas vai a aula:** não depende do PDF e não erra, mas pede uma escolha por dia. Ficou como o "Preencher à mão".
- **Ler o PDF com OCR (tesseract.js):** lê também o PDF sem texto, mas baixa alguns MB e erra horários. Descartado.
- **Mandar o PDF ao servidor para ler:** o PDF traz nome, matrícula, RG e CPF. Descartado pela minimização da LGPD.

## Consequences

- Substitui a ADR 0015 para quem importa a grade. Sem grade, a rotina continua sendo um horário só.
- A leitura depende do layout do portal da ESAMC: tabela com os dias nas colunas, linhas "Das HH:MM às HH:MM" e "Sala" em cada aula. Se o layout mudar, a importação falha e sobra o preenchimento à mão.
- O pdf.js (cerca de 1 MB) só é baixado quando a pessoa escolhe um PDF.
- A melhor chegada é uma consulta a mais ao servidor nos dias com aula. Ela não leva nada da grade além do horário da primeira aula.
