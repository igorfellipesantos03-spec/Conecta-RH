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
          const deptsCodes = user.managedDepts.map(d => d.departmentCode);
          where.departamentCode = { in: deptsCodes };
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
  async finalizarLink(id, respostas, resultado, departamentCode, departmentDescription) {
    const novaExpiracao = new Date();
    novaExpiracao.setMinutes(novaExpiracao.getMinutes() + 10);

    const deptCode = departamentCode ? departamentCode.trim() : null;
    // Limpar descrição: "TI - DIORGNY" → "TI"
    const rawDesc = departmentDescription || '';
    const cleanDeptDesc = rawDesc.split(' - ')[0].trim() || null;

    const concludedLink = await prisma.discLink.update({
      where: { id },
      data: {
        respostas: respostas || null,
        resultado: resultado || null,
        departamentCode: deptCode,
        departmentDescription: cleanDeptDesc,
        status: 'CONCLUDED',
        isActive: false,
        expiraEm: novaExpiracao
      }
    });

    const cleanDesc = cleanDeptDesc;
    const empresaId = concludedLink.companyId;
    const filialId = concludedLink.branchId;

    if (deptCode && cleanDesc && empresaId && filialId) {
      try {
        await prisma.department.upsert({
          where: {
            departmentCode_empresaId_filialId: {
              departmentCode: deptCode,
              empresaId,
              filialId
            }
          },
          update: { departmentDescription: cleanDesc },
          create: {
            departmentCode: deptCode,
            departmentDescription: cleanDesc,
            empresaId,
            filialId
          }
        });
      } catch (e) {
        console.warn('Erro ao cachear Department:', e.message);
      }
    }

    return concludedLink;
  }
}

module.exports = new DiscLinkService();
