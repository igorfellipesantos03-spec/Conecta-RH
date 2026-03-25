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
    expiraEm.setHours(expiraEm.getHours() + 24); // Exatamente AGORA + 24 horas

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
   * Valida o acesso ao link. Inativa se estiver expirado ou progride o estado.
   */
  async validarAcessoLink(id) {
    const link = await prisma.discLink.findUnique({ where: { id } });

    if (!link) {
      throw new Error('Link não encontrado.');
    }

    const agora = new Date();

    // Regra: Se Agora > expiraEm, inativa o link e lança erro
    if (agora > link.expiraEm || !link.isActive) {
      if (link.isActive) {
        // Atualiza banco para refletir a expiração
        await prisma.discLink.update({
          where: { id },
          data: { isActive: false, status: 'EXPIRED' }
        });
      }
      throw new Error('Link expirado ou já utilizado.');
    }

    // Regra: Se o status for PENDING, atualiza para PROGRESS e expande para +1 hora
    if (link.status === 'PENDING') {
      const novaExpiracao = new Date();
      novaExpiracao.setHours(novaExpiracao.getHours() + 1); // AGORA + 1 hora

      const updatedLink = await prisma.discLink.update({
        where: { id },
        data: {
          status: 'PROGRESS',
          expiraEm: novaExpiracao
        }
      });
      return updatedLink;
    }

    return link;
  }

  async finalizarLink(id) {
    const novaExpiracao = new Date();
    novaExpiracao.setMinutes(novaExpiracao.getMinutes() + 10); // AGORA + 10 minutos (segurança)

    const concludedLink = await prisma.discLink.update({
      where: { id },
      data: {
        status: 'CONCLUDED',
        isActive: false, // Pode desativar de vez as opções de leitura nova
        expiraEm: novaExpiracao
      }
    });

    return concludedLink;
  }
}

module.exports = new DiscLinkService();
