# Sem notificações push nem alertas nesta versão

O `Arquitetura.md` previa alertas como "Av. X está lotada às 19h". Notificações push num PWA exigem guardar no servidor uma inscrição por aparelho, que funciona como um identificador fixo e contradiz a ADR 0004. Como a chance muda só uma vez por semana (ADR 0011), o alerta repetiria a mesma informação toda noite, e a rotina (ADR 0015) já abre o app na faixa horária certa. Decidimos não ter notificações push nem alertas nesta versão. O tema pode voltar com uma ADR nova se o uso recorrente ficar abaixo da meta de 30%.
