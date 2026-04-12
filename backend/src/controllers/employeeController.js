const prisma = require('../lib/prisma');
const { buscarFuncionarioPorCpfSistema } = require('../services/protheusService');

/**
 * Controller para checar o CPF do candidato usando os parametros do Token.
 * Usa token de SISTEMA (não depende de sessão de usuário logado),
 * pois esta é uma rota pública acessada pelo formulário DISC.
 */
const checkCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    const { token } = req.query;

    if (!cpf || !token) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF e Token são obrigatórios.' });
    }

    // Busca o Link no PostgreSQL
    const discLink = await prisma.discLink.findUnique({
      where: { id: token }
    });

    if (!discLink) {
      return res.status(404).json({ sucesso: false, mensagem: 'Token inválido ou não encontrado.' });
    }

    // Se não for funcionário, apenas retorna "Liberado" sem buscar no Protheus
    if (!discLink.isEmployee) {
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Candidato externo. CPF liberado para responder o teste.',
        dados: {
          isEmployee: false,
          cpf,
          nome: 'Candidato Externo' // Front-end vai pedir o campo nome
        }
      });
    }

    // Se FOR funcionário atual, busca no Protheus usando token de SISTEMA
    try {
      const funcionarioDados = await buscarFuncionarioPorCpfSistema(cpf, discLink.companyId, discLink.branchId);
      
      const items = funcionarioDados?.items || funcionarioDados;
      if (!items || items.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Funcionário não encontrado no Protheus para esta Empresa/Filial.'
        });
      }

      // Retorna o primeiro encontrado e aplica LGPD (higienização)
      const func = Array.isArray(items) ? items[0] : items;

      // Limpar descrição do departamento: "TI - DIORGNY" → "TI"
      const rawDeptDesc = func.departmentDescription || '';
      const cleanDeptDesc = rawDeptDesc.split(' - ')[0].trim();
      const deptCode = (func.departamentCode || '').trim();

      return res.status(200).json({
        sucesso: true,
        dados: {
          isEmployee: true,
          nome: func.name,
          name: func.name, // Retrocompatibilidade temporária com DiscForm
          departamentCode: deptCode,
          departmentDescription: cleanDeptDesc,
          // Retrocompatibilidade temporária — front-end legado usa estes campos
          costCenterCode: deptCode,
          costCenterDescription: cleanDeptDesc
        }
      });

    } catch (protheusError) {
      console.error('Erro ao buscar no Protheus:', protheusError.message);
      return res.status(502).json({
        sucesso: false,
        mensagem: 'Erro de comunicação com o sistema TOTVS Protheus.',
        erro: protheusError.response?.data || protheusError.message
      });
    }

  } catch (error) {
    console.error('Erro em checkCpf:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Ocorreu um erro interno no servidor ao checar o CPF.',
      erro: error.message
    });
  }
};

module.exports = {
  checkCpf
};
