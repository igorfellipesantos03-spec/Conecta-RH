const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

class DiscLinkService {
  /**
   * Cria um novo link do DISC com expiração de 24 horas.
   */
  async criarLink({ isEmployee, companyId, branchId }) {
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 24);

    const novoLink = await prisma.discLink.create({
      data: {
        isEmployee,
        companyId: companyId || null,
        branchId: branchId || null,
        status: 'PENDING',
        isActive: true,
        expiraEm
      }
    });

    return novoLink;
  }

  /**
   * Retorna links DISC com filtro baseado na empresa/filial do usuário.
   * Executa a auto-expiração (lazy expiration) de links que já passaram
   * da data limite antes de retornar a lista.
   *
   * @param {string} role - Papel do usuário autenticado ('ADMIN', 'RH')
   * @param {string|null} empresaId - Código da empresa do usuário
   * @param {string|null} filialId - Código da filial do usuário
   */
  async listarLinks(role, empresaId, filialId) {
    const agora = new Date();

    try {
      // 1. Expira automaticamente todos os links cujo expiraEm já passou
      await prisma.discLink.updateMany({
        where: {
          expiraEm: { lt: agora },
          status: { notIn: ['EXPIRED', 'CONCLUDED'] }
        },
        data: {
          status: 'EXPIRED',
          isActive: false
        }
      });
    } catch (e) {
      console.warn('Erro ao rodar auto-expiração no ListarLinks via Prisma:', e.message);
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query("UPDATE disc_links SET status = 'EXPIRED', is_active = false WHERE expira_em < NOW() AND status NOT IN ('EXPIRED', 'CONCLUDED')");
      await pool.end();
    }

    // 2. Monta o filtro RBAC por empresa/filial
    // ADMIN vê todos, RH vê apenas da sua empresa/filial
    let where = {};
    if (role !== 'ADMIN' && empresaId && filialId) {
      where = { companyId: empresaId, branchId: filialId };
    } else if (role !== 'ADMIN' && empresaId) {
      where = { companyId: empresaId };
    }

    return prisma.discLink.findMany({
      where,
      orderBy: { criadoEm: 'desc' }
    });
  }

  /**
   * Registra nome e CPF do respondente e avança o status para PROGRESS.
   * Chamado quando o candidato/colaborador clica em "Iniciar".
   */
  async iniciarTeste(id, nome, cpf) {
    // Garante que o CPF seja salvo apenas com números (remove máscara)
    const cpfNumeros = cpf ? cpf.replace(/\D/g, '') : null;

    const link = await prisma.discLink.findUnique({ where: { id } });

    if (!link) {
      throw new Error('Link não encontrado.');
    }

    const agora = new Date();
    if (agora > link.expiraEm || !link.isActive) {
      throw new Error('Link expirado ou inativo.');
    }

    if (link.status !== 'PENDING') {
      throw new Error(`Link não está em estado PENDING. Status atual: ${link.status}`);
    }

    const novaExpiracao = new Date();
    novaExpiracao.setHours(novaExpiracao.getHours() + 1); // +1 hora para completar o teste

    const updatedLink = await prisma.discLink.update({
      where: { id },
      data: {
        nome,
        cpf: cpfNumeros,
        status: 'PROGRESS',
        expiraEm: novaExpiracao
      }
    });

    return updatedLink;
  }

  /**
   * Valida o acesso ao link. Inativa se estiver expirado ou progride o estado.
   */
  async validarAcessoLink(id) {
    const link = await prisma.discLink.findUnique({ where: { id } });

    if (!link) {
      throw new Error('Link não encontrado.');
    }

    const agora = new Date();

    if (agora > link.expiraEm || !link.isActive) {
      if (link.isActive) {
        await prisma.discLink.update({
          where: { id },
          data: { isActive: false, status: 'EXPIRED' }
        });
      }
      throw new Error('Link expirado ou já utilizado.');
    }

    return link;
  }

  /**
   * Finaliza o teste: persiste as respostas, o resultado DISC e o departamentCode
   * do respondente, e altera o status para CONCLUDED.
   *
   * O departamentCode é salvo aqui para que o GESTOR consiga filtrar os resultados
   * da sua equipe posteriormente na listagem do DiscHub.
   */
  async finalizarLink(id, respostas, resultado, departamentCode) {
    const novaExpiracao = new Date();
    novaExpiracao.setMinutes(novaExpiracao.getMinutes() + 10);

    const concludedLink = await prisma.discLink.update({
      where: { id },
      data: {
        respostas: respostas || null,
        resultado: resultado || null,
        departamentCode: departamentCode || null,  // Salvo para futuro filtro por gestor
        status: 'CONCLUDED',
        isActive: false,
        expiraEm: novaExpiracao
      }
    });

    return concludedLink;
  }
}

module.exports = new DiscLinkService();
