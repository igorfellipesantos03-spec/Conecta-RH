const prisma = require('../lib/prisma');

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
   */
  async listarLinks(role, empresaId, filialId, username) {
    const agora = new Date();
    try {
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
      console.warn('Erro ao rodar auto-expiração:', e.message);
    }

    let where = {};
    if (role === 'GESTOR') {
      where = { companyId: empresaId, branchId: filialId };
      if (username) {
        const user = await prisma.user.findUnique({ 
          where: { username }, 
          include: { managedDepts: true } 
        });
        if (user && user.managedDepts && user.managedDepts.length > 0) {
          const deptsNames = user.managedDepts.map(d => d.departmentName);
          where.departamentCode = { in: deptsNames };
        } else {
          where.departamentCode = { in: [] };
        }
      }
    } else if (role !== 'ADMIN' && empresaId && filialId) {
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
   * Registra nome e CPF.
   */
  async iniciarTeste(id, nome, cpf) {
    const cpfNumeros = cpf ? cpf.replace(/\D/g, '') : null;
    const link = await prisma.discLink.findUnique({ where: { id } });
    if (!link) throw new Error('Link não encontrado.');

    const agora = new Date();
    if (agora > link.expiraEm || !link.isActive) throw new Error('Link expirado ou inativo.');
    if (link.status !== 'PENDING') throw new Error(`Status inválido: ${link.status}`);

    const novaExpiracao = new Date();
    novaExpiracao.setHours(novaExpiracao.getHours() + 1);

    return prisma.discLink.update({
      where: { id },
      data: {
        nome,
        cpf: cpfNumeros,
        status: 'PROGRESS',
        expiraEm: novaExpiracao
      }
    });
  }

  /**
   * Valida o acesso ao link.
   */
  async validarAcessoLink(id) {
    const link = await prisma.discLink.findUnique({ where: { id } });
    if (!link) throw new Error('Link não encontrado.');

    const agora = new Date();
    if (agora > link.expiraEm || !link.isActive) {
      if (link.isActive) {
        await prisma.discLink.update({
          where: { id },
          data: { isActive: false, status: 'EXPIRED' }
        });
      }
      throw new Error('Link expirado ou inativo.');
    }
    return link;
  }

  /**
   * Busca link concluído por CPF.
   */
  async obterLinkPorCpf(cpf) {
    if (!cpf) return null;
    return prisma.discLink.findFirst({
      where: { cpf, status: 'CONCLUDED' },
      orderBy: { criadoEm: 'desc' },
    });
  }

  /**
   * Finaliza o teste.
   */
  async finalizarLink(id, respostas, resultado, departamentCode, costCenterCode) {
    const novaExpiracao = new Date();
    novaExpiracao.setMinutes(novaExpiracao.getMinutes() + 10);

    const concludedLink = await prisma.discLink.update({
      where: { id },
      data: {
        respostas: respostas || null,
        resultado: resultado || null,
        departamentCode: departamentCode || null,
        status: 'CONCLUDED',
        isActive: false,
        expiraEm: novaExpiracao
      }
    });

    const code = costCenterCode ? costCenterCode.trim() : null;
    const description = departamentCode ? departamentCode.trim() : null;
    const empresaId = concludedLink.companyId;
    const filialId = concludedLink.branchId;

    if (code && description && empresaId && filialId) {
      try {
        await prisma.costCenter.upsert({
          where: {
            costCenterCode_empresaId_filialId: {
              costCenterCode: code,
              empresaId,
              filialId
            }
          },
          update: { costCenterDescription: description },
          create: {
            costCenterCode: code,
            costCenterDescription: description,
            empresaId,
            filialId
          }
        });
      } catch (e) {
        console.warn('Erro ao cachear CostCenter:', e.message);
      }
    }

    return concludedLink;
  }
}

module.exports = new DiscLinkService();
