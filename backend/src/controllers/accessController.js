const prisma = require('../lib/prisma');

// Criar Solicitação de Acesso
const createRequest = async (req, res) => {
  try {
    const { username } = req.user;
    const { requestedDepts, justification, requestedEmpresaId, requestedFilialId } = req.body;

    if (!requestedDepts || !Array.isArray(requestedDepts) || requestedDepts.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum departamento solicitado.' });
    }

    if (!requestedEmpresaId || !requestedFilialId) {
      return res.status(400).json({ success: false, message: 'Empresa e Filial são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    
    // Verifica se já existe um pendente
    const pendingRequest = await prisma.accessRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' }
    });
    
    if (pendingRequest) {
      return res.status(400).json({ success: false, message: 'Você já possui uma solicitação pendente.' });
    }

    const newRequest = await prisma.accessRequest.create({
      data: {
        userId: user.id,
        requestedDepts,
        justification,
        requestedEmpresaId,
        requestedFilialId
      }
    });

    return res.status(201).json({ success: true, message: 'Solicitação criada com sucesso.', data: newRequest });
  } catch (error) {
    console.error('Erro criar request:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao criar solicitação.' });
  }
};

// Listar Solicitações (RH/Admin)
const getRequests = async (req, res) => {
  try {
    const requests = await prisma.accessRequest.findMany({
      include: {
        user: {
          select: { name: true, cpf: true, role: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Erro buscar requests:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao buscar solicitações.' });
  }
};

// Aprovar Solicitação
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUsername = req.user.username; // from JWT
    
    const request = await prisma.accessRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Solicitação não encontrada.' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Solicitação não está pendente.' });
    
    // admin userId
    const adminUser = await prisma.user.findUnique({ where: { username: adminUsername } });
    
    await prisma.$transaction(async (tx) => {
      // Muda o status e registra quem aprovou
      await tx.accessRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: new Date(),
          resolvedBy: adminUser.id
        }
      });
      
      // Promove o User a GESTOR e seta empresa/filial que ele informou
      const targetUser = await tx.user.findUnique({ where: { id: request.userId } });
      if (targetUser.role === 'USER') {
        await tx.user.update({
          where: { id: request.userId },
          data: {
            role: 'GESTOR',
            empresaId: request.requestedEmpresaId || targetUser.empresaId,
            filialId: request.requestedFilialId || targetUser.filialId
          }
        });
      }
      
      // Cria/Ignora os vínculos no ManagerDepartment
      const depts = (request.requestedDepts || []);
      for (const dept of depts) {
        const code = dept.code || dept.departamentCode || dept.id;
        const rawName = dept.name || dept.description || dept.label;
        if (!code || !rawName) continue;
        
        // Limpar descrição: "TI - DIORGNY" → "TI"
        const cleanName = rawName.toString().split(' - ')[0].trim();
        
        await tx.managerDepartment.upsert({
          where: {
            userId_departmentCode: {
              userId: request.userId,
              departmentCode: code.toString().trim()
            }
          },
          update: {},
          create: {
            userId: request.userId,
            departmentCode: code.toString().trim(),
            departmentName: cleanName
          }
        });
      }
    });

    return res.status(200).json({ success: true, message: 'Solicitação aprovada e acessos concedidos.' });
  } catch (error) {
    console.error('Erro aprovar request:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao aprovar solicitação.' });
  }
};

// Recusar Solicitação
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUsername = req.user.username;
    
    const request = await prisma.accessRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Solicitação não encontrada.' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Solicitação não está pendente.' });

    const adminUser = await prisma.user.findUnique({ where: { username: adminUsername } });

    await prisma.accessRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
        resolvedBy: adminUser.id
      }
    });

    return res.status(200).json({ success: true, message: 'Solicitação recusada.' });
  } catch (error) {
    console.error('Erro recusar request:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao recusar solicitação.' });
  }
};

// Listar Departamentos disponíveis (filtrado por empresa+filial)
const getDepartments = async (req, res) => {
  try {
    const { empresaId, filialId } = req.query;

    if (!empresaId || !filialId) {
      return res.status(400).json({ success: false, message: 'empresaId e filialId são obrigatórios.' });
    }

    const departments = await prisma.department.findMany({
      where: { empresaId, filialId },
      orderBy: { departmentDescription: 'asc' }
    });

    // Retrocompatibilidade: retornar também com nomes legados para frontend
    const mappedData = departments.map(d => ({
      ...d,
      departmentCode: d.departmentCode,
      departmentDescription: d.departmentDescription,
      // Compat legado
      costCenterCode: d.departmentCode,
      costCenterDescription: d.departmentDescription
    }));

    return res.status(200).json({ success: true, data: mappedData });
  } catch (error) {
    console.error('Erro buscar departamentos:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao buscar departamentos.' });
  }
};

module.exports = {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  getDepartments
};
