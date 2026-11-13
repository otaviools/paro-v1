import { prepararBancoDoApp } from '../banco/do-app'

/**
 * Conecta ao banco e aplica as migrações na inicialização do servidor. Se
 * falhar, o servidor sobe assim mesmo e tenta de novo na primeira consulta.
 */
export default defineNitroPlugin(async () => {
  try {
    await prepararBancoDoApp()
  }
  catch (erro) {
    console.error('Não foi possível preparar o banco na inicialização:', erro)
  }
})
