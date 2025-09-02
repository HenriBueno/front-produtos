import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getProducts, showProduct } from 'src/store/models/ProductSlice';
import { updateMultipleParProduct } from 'src/store/models/ParProductSlice';
import { createAmostra, deleteAmostra, getAmostras } from 'src/store/models/AmostraSlice';
import { createMedicao, deleteMedicao, getMedicoes } from 'src/store/models/MedicaoSlice';
import {
  createProject,
  deleteProject,
  getProject,
  ProjectProps,
  ProjetoFormValues,
  showProject,
  updateProject,
} from 'src/store/models/ProjectSlice';
import {
  createMultipleParametros,
  deleteMultipleParametros,
  getParametros,
  updateMultipleParametros,
  updateParametro,
} from 'src/store/models/ParMedicaoSlice';

import Modal from 'src/components/Modal/Modal';
import { Iconify } from 'src/components/iconify';
import GenericForm from 'src/components/Formulário/Form';

import ProductSpecificationTab from '../productSpecification-tab';
import ProductSpecificationTable from '../productSpecification-table';

export interface Projeto {
  id: string;
  numero?: string;
  criadoEm?: Date;
  amostras?: Amostra[];
}

export type AbaProjeto = {
  label: React.ReactNode;
  value: string;
  content: React.ReactNode;
};

export const parametrosProduto = [
  { label: 'Potência', key: 'potencia', unidade: 'W' },
  { label: 'Tensão', key: 'tensao', unidade: 'V' },
  { label: 'Frequência', key: 'frequencia', unidade: 'Hz' },
  { label: 'Corrente', key: 'corrente', unidade: 'A' },
  { label: 'Fluxo luminoso', key: 'fluxo', unidade: 'lm' },
  { label: 'Eficiência luminosa', key: 'eficiencia', unidade: 'lm/W' },
  { label: 'Intensidade luminosa', key: 'intensidade', unidade: 'cd' },
  { label: 'TCC (Temperatura de cor correlacionada)', key: 'tcc', unidade: 'K' },
  { label: 'Ângulo de abertura', key: 'angulo', unidade: '°' },
  { label: 'IRC (ìndice de reprodução de cores)', key: 'irc', unidade: '' },
  { label: 'R9', key: 'r9', unidade: '' },
];

export type AmostrasSelecionadasPorProjeto = {
  [projetoId: string]: Amostra | null;
};

export type ParametroProduto = {
  id: string;
  nome: string;
  valor: number;
  unidade?: string | null;
  medicaoId?: string;
  parametro?: string;
};

export type Medicao = {
  id: string;
  tipoMedicao: string;
  amostraId: string;
  criadoEm: Date;
  projetoId?: string;
  parametros: ParametroProduto[];
};

interface MedicaoCreate {
  produtoId: string;
  projetoId: string;
  amostraId: string;
  tipoMedicao: string;
  criadoEm?: Date;
}

export type Amostra = {
  id: string;
  codigo: string;
  criadoEm: Date;
  projetoId: string;
  medicoes: Medicao[];
};

export function ProductSpecificationView() {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { selected: product, loading, error } = useAppSelector((state) => state.products);
  const amostras = useAppSelector((state) => state.amostra.data) as Amostra[];
  const [carregamentoAmostra, setCarregamentoAmostra] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModeMedicao, setEditModeMedicao] = useState<{ [key: string]: boolean }>({});
  const [OpenModalForm, setOpenModalForm] = useState(false);
  const [openModalCriarAmostra, setOpenModalCriarAmostra] = useState(false);
  const [openModalDeletarAmostra, setOpenModalDeletarAmostra] = useState(false);
  const [openModalCriarMedicao, setOpenModalCriarMedicao] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const handleOpenModalForm = () => setOpenModalForm(true);
  const [initialSteateAba, setinitialSteateAba] = useState('1');
  const [initialSteateAba2, setinitialSteateAba2] = useState('1');
  const [projetoParaEditar, setProjetoParaEditar] = useState<ProjectProps | null>(null);
  const [abaProjeto, setAbaProjeto] = useState<AbaProjeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [amostrasAtualizadas, setAmostrasAtualizadas] = useState(false);
  const [deletarAmostra, setDeletarAmostra] = useState(false);
  const [amostrasSelecionadas, setAmostrasSelecionadas] = useState<AmostrasSelecionadasPorProjeto>(
    {}
  );
  const [rowsProduto, setRowsProduto] = useState<Record<string, any>[]>([]);
  const [rowsMedicao, setRowsMedicao] = useState<Medicao[]>([]);
  const [historicoAbas, setHistoricoAbas] = useState<string[]>([]);
  const [amostraCriada, setAmostraCriada] = useState(false);
  const [editarMedicao, setEditarMedicao] = useState(false);

  const [openModalDeletarMedicao, setOpenModalDeletarMedicao] = useState<{
    open: boolean;
    medicao?: Medicao;
  }>({ open: false });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formFields = useMemo(
    () => [{ name: 'numero', label: 'Numero do projeto', required: true }],
    []
  );

  const algumEditando = Object.values(editModeMedicao).some((value) => value === true);

  useEffect(() => {
    <CircularProgress color="inherit" />;
  }, [isRedirecting]);

  useEffect(() => {
    const todasAbas = [
      { value: '1' },
      { value: '2' },
      ...abaProjeto.map((aba) => ({ value: aba.value })),
    ];

    const existeAbaSelecionada = todasAbas.some((aba) => aba.value === initialSteateAba);

    if (!existeAbaSelecionada) {
      const ultimaAbaValida = [...historicoAbas]
        .reverse()
        .find((val) => todasAbas.some((aba) => aba.value === val));
      setinitialSteateAba(ultimaAbaValida || '2');
    }
  }, [abaProjeto, initialSteateAba, historicoAbas, initialSteateAba2]);

  const openSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleToggleEdit = () => {
    if (editMode) {
      if (product?.projetos) {
        const parametrosAtualizados = rowsProduto
          .map((row) => {
            const parametroInfo = parametrosProduto.find((p) => p.label === row.parametro);
            if (!parametroInfo) {
              return null;
            }
            const keyNormalizado = parametroInfo.key.toLowerCase().trim();
            const original = product.parametros.find(
              (p) => p.nome.toLowerCase().trim() === keyNormalizado
            );
            if (!original) {
              return null;
            }
            const valorConvertido = Number(row.valor.toString().replace(',', '.'));
            if (isNaN(valorConvertido)) {
              return null;
            }
            return {
              id: original.id,
              valor: valorConvertido,
            };
          })
          .filter((p): p is { id: string; valor: number } => p !== null);
        setIsRedirecting(true);
        dispatch(
          updateMultipleParProduct({
            produtoId: product.id,
            parametros: parametrosAtualizados,
          })
        )
          .unwrap()
          .then(() => {
            openSnackbar('Parâmetros atualizados com sucesso!', 'success');
          })
          .catch(() => {
            openSnackbar('Erro ao atualizar parâmetros.', 'error');
          })
          .finally(() => {
            setIsRedirecting(false);
            dispatch(showProduct(product.id));
            setinitialSteateAba('1');
          });
      }
    }

    setEditMode(!editMode);
  };

  const handleEditMedicao = (medicao: Medicao) => {
    setEditarMedicao(true);
    const isCurrentlyEditing = editModeMedicao[medicao.id] || false;

    if (isCurrentlyEditing) {
      if (!medicao.projetoId) {
        return;
      }
      const amostraId = amostrasSelecionadas[medicao.projetoId]?.id;
      if (!amostraId || !product) return;
      const parametrosAtualizados = medicao.parametros
        .map((row: ParametroProduto) => {
          const parametroInfo = parametrosProduto.find((p) => p.label === row.parametro);
          if (!parametroInfo) return null;

          const keyNormalizado = parametroInfo.key.toLowerCase().trim();
          const original = medicao.parametros.find(
            (p: ParametroProduto) => p.nome.toLowerCase().trim() === keyNormalizado
          );
          if (!original) return null;

          const valorConvertido = Number(row.valor.toString().replace(',', '.'));
          if (isNaN(valorConvertido)) return null;
          return { id: original.id, valor: valorConvertido };
        })
        .filter((p): p is { id: string; valor: number } => p !== null);

      if (parametrosAtualizados.length === 0) return;

      dispatch(
        updateMultipleParametros({
          produtoId: product.id,
          projetoId: medicao.projetoId,
          amostraId,
          medicaoId: medicao.id,
          parametros: parametrosAtualizados,
        })
      )
        .unwrap()
        .then(() => openSnackbar('Parâmetros atualizados com sucesso!', 'success'))
        .catch(() => openSnackbar('Erro ao atualizar parâmetros.', 'error'));
      setEditarMedicao(false);
    }

    setEditModeMedicao((prev) => ({
      ...prev,
      [medicao.id]: !isCurrentlyEditing,
    }));
  };

  const handleDeleteMedicao = async (medicao: Medicao) => {
    try {
      if (!medicao.projetoId || !product?.id) return;

      // Deleta os parâmetros se existirem
      const parametrosAtualizados = medicao.parametros
        .map((row) => {
          const parametroInfo = parametrosProduto.find((p) => p.label === row.parametro);
          if (!parametroInfo) return null;
          const original = medicao.parametros.find(
            (p) => p.nome.toLowerCase().trim() === parametroInfo.key.toLowerCase().trim()
          );
          return original?.id ?? null;
        })
        .filter((p): p is string => p !== null);

      if (parametrosAtualizados.length > 0) {
        await dispatch(
          deleteMultipleParametros({
            produtoId: product.id,
            projetoId: medicao.projetoId,
            amostraId: medicao.amostraId,
            medicaoId: medicao.id,
            parametrosIds: parametrosAtualizados,
          })
        ).unwrap();
      }

      await dispatch(
        deleteMedicao({
          produtoId: product.id,
          projetoId: medicao.projetoId,
          amostraId: medicao.amostraId,
          medicaoId: medicao.id,
        })
      ).unwrap();

      if (deletarAmostra === false) {
        openSnackbar('Medição deletada com sucesso!', 'success');
      }
    } catch (error) {
      openSnackbar('Erro ao deletar medição ou parâmetros.', 'error');
    } finally {
      if (deletarAmostra === false) {
        setOpenModalDeletarMedicao({ open: false });
      }
    }
  };

  useEffect(() => {
    if (id) dispatch(showProduct(id));
  }, [id]);

  // Produto
  useEffect(() => {
    if (product?.parametros) {
      const parsed = parametrosProduto.map(({ label, key }) => {
        const encontrado = product.parametros.find((p) => p.nome.toLowerCase() === key);
        return {
          parametro: label,
          valor: encontrado?.valor === -999 ? '-' : (encontrado?.valor ?? '-'),
          unidade: !encontrado?.unidade ? '-' : encontrado.unidade,
        };
      });
      setRowsProduto(parsed);
    }
  }, [product]);

  // Memoriza as chaves do estado de amostras selecionadas
  const projetosSelecionados = useMemo(
    () => Object.keys(amostrasSelecionadas),
    [amostrasSelecionadas]
  );

  // Filtra apenas as amostras que estão selecionadas
  const amostrasFiltradas = useMemo(() => {
    if (!amostras.length) return [];

    return amostras.filter((amostra) =>
      projetosSelecionados.some((id) => amostrasSelecionadas[id]?.id === amostra.id)
    );
  }, [amostras, projetosSelecionados, amostrasSelecionadas]);

  const parsedMedicoes = useMemo<Medicao[]>(() => {
    if (!amostrasFiltradas.length) return [];

    return amostrasFiltradas.flatMap((amostra: Amostra) =>
      amostra.medicoes.map((medicao: Medicao) => ({
        id: medicao.id,
        tipoMedicao: medicao.tipoMedicao,
        amostraId: amostra.id,
        criadoEm: medicao.criadoEm,
        projetoId: amostra.projetoId,
        parametros: parametrosProduto.map(
          ({ label, key, unidade }: { label: string; key: string; unidade?: string }) => {
            const encontrado = medicao.parametros.find((p) => p.nome?.toLowerCase() === key);
            return {
              parametro: label,
              id: encontrado?.id ?? '',
              nome: encontrado?.nome ?? '',
              valor: encontrado?.valor && encontrado.valor !== 0 ? encontrado.valor : 0,
              unidade: encontrado?.unidade || unidade || '-',
            };
          }
        ),
      }))
    );
  }, [amostrasFiltradas]);

  // Atualiza o estado apenas quando parsedMedicoes realmente muda
  const prevParsedMedicoesRef = useRef<typeof parsedMedicoes>([]);

  useEffect(() => {
    // Verifica se houve mudanças reais
    const isSame =
      prevParsedMedicoesRef.current.length === parsedMedicoes.length &&
      prevParsedMedicoesRef.current.every((m, i) => m.id === parsedMedicoes[i].id);

    if (!isSame) {
      setCarregamentoAmostra(true);
      setRowsMedicao(parsedMedicoes);
      prevParsedMedicoesRef.current = parsedMedicoes;
    }
  }, [parsedMedicoes]);

  useEffect(() => {
    const carregar = async () => {
      if (!product?.id || !initialSteateAba2) return;

      if (initialSteateAba2 === '1' || initialSteateAba2 === '2') {
        if (!projetoSelecionado?.id) {
          return;
        }
        try {
          if (editarMedicao === false) {
            setIsRedirecting(true);
          }
          const projetoName = await dispatch(
            showProject({
              productId: product.id,
              data: { projetoId: projetoSelecionado.id },
            })
          ).unwrap();

          const novasAmostras = await dispatch(
            getAmostras({
              produtoId: product.id,
              projetoId: projetoSelecionado.id,
            })
          ).unwrap();
          handleAbrirAbaProjeto(projetoName, novasAmostras);
        } finally {
          setAmostrasAtualizadas(false);
          setAmostraCriada(false);
          setCarregamentoAmostra(false);
          setIsRedirecting(false);
        }
      } else {
        try {
          if (editarMedicao === false) {
            setIsRedirecting(true);
          }
          const projetoName = await dispatch(
            showProject({
              productId: product.id,
              data: { projetoId: initialSteateAba2 },
            })
          ).unwrap();

          const novasAmostras = await dispatch(
            getAmostras({
              produtoId: product.id,
              projetoId: initialSteateAba2,
            })
          ).unwrap();

          handleAbrirAbaProjeto(projetoName, novasAmostras);
        } finally {
          setCarregamentoAmostra(false);
          setAmostrasAtualizadas(false);
          setAmostraCriada(false);
          setIsRedirecting(false);
        }
      }
    };
    carregar();
  }, [
    product?.id,
    initialSteateAba,
    initialSteateAba2,
    projetoSelecionado?.id,
    amostrasAtualizadas,
    amostraCriada,
    amostrasSelecionadas,
    carregamentoAmostra,
    editModeMedicao,
    rowsMedicao,
    openModalDeletarMedicao,
  ]);

  if (error) return <p>Erro: {error}</p>;
  if (!product) return <p>Produto não encontrado.</p>;

  const handleSubmitProject = async (productId: string, data: ProjectProps) => {
    setIsRedirecting(true);

    try {
      let response;
      if (projetoParaEditar) {
        // EDITAR
        response = await dispatch(
          updateProject({
            productId,
            data: { ...data, projetoId: projetoParaEditar.id },
          })
        ).unwrap();
      } else {
        // CRIAR
        response = await dispatch(createProject({ productId, data })).unwrap();
      }

      openSnackbar(response.msg, 'success');

      setOpenModalForm(false);
      setProjetoParaEditar(null);
      dispatch(showProduct(product.id));
      setinitialSteateAba('2');
    } catch (error: any) {
      openSnackbar(error, 'error');
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleDeleteProject = ({
    productId,
    data,
  }: {
    productId: string;
    data: { projetoId: string };
  }) => {
    setIsRedirecting(true);
    dispatch(deleteProject({ productId, data }))
      .then((result) => {
        if (deleteProject.fulfilled.match(result)) {
          openSnackbar('Projeto deletado com sucesso!', 'success');
        } else {
          openSnackbar('Erro ao deletar o projeto.', 'error');
        }
      })
      .finally(() => {
        setIsRedirecting(false);
        dispatch(showProduct(product.id));
        setinitialSteateAba('2');
      });
  };

  const handleDeleteAmostra = async () => {
    if (!amostrasSelecionadas) return;

    const projetoId =
      initialSteateAba2 === '1' || initialSteateAba2 === '2' ? initialSteateAba : initialSteateAba2;

    const amostraFind = amostrasSelecionadas[projetoId];

    if (!amostraFind) {
      openSnackbar('Nenhuma amostra selecionada para deletar.', 'error');
      setOpenModalDeletarAmostra(false);

      return;
    }

    try {
      const result = await dispatch(
        deleteAmostra({
          produtoId: product.id,
          projetoId,
          amostraId: amostraFind.id,
        })
      );

      if (deleteAmostra.fulfilled.match(result)) {
        openSnackbar('Amostra deletada com sucesso!', 'success');
      } else {
        openSnackbar('Erro ao deletar a amostra.', 'error');
      }
    } catch (error) {
      openSnackbar('Erro ao deletar medições da amostra.', 'error');
    } finally {
      setDeletarAmostra(false);
      setOpenModalDeletarAmostra(false);
      setAmostrasSelecionadas((prev) => {
        const novo = { ...prev };
        delete novo[projetoId];
        return novo;
      });
    }
  };

  const handleEditProject = (row: Record<string, any>) => {
    setProjetoParaEditar({
      id: row.id,
      numero: row.projeto,
    });
    setOpenModalForm(true);
  };

  const handleCreateAmostra = async (data: Amostra) => {
    if (!product?.id || !initialSteateAba || !initialSteateAba2) {
      openSnackbar('Erro ao criar amostra: produto ou projeto inválido.', 'error');
      return;
    }

    if (initialSteateAba2 === '2') {
      try {
        const response = await dispatch(
          createAmostra({
            produtoId: product.id,
            projetoId: initialSteateAba,
            codigo: data.codigo,
          })
        ).unwrap();
        openSnackbar('Amostra criada com sucesso!', 'success');
        setOpenModalCriarAmostra(false);
      } catch (error: any) {
        openSnackbar(error || 'Erro ao criar amostra', 'error');
      } finally {
        setAmostrasAtualizadas(true);
        setAmostraCriada(true);
      }
    } else {
      try {
        const response = await dispatch(
          createAmostra({
            produtoId: product.id,
            projetoId: initialSteateAba2,
            codigo: data.codigo,
          })
        ).unwrap();
        openSnackbar('Amostra criada com sucesso!', 'success');
        setOpenModalCriarAmostra(false);
      } catch (error: any) {
        openSnackbar(error || 'Erro ao criar amostra', 'error');
      } finally {
        setAmostrasAtualizadas(true);
        setAmostraCriada(true);
      }
    }
  };

  const handleCreateMedicao = async (medicao: MedicaoCreate) => {
    try {
      const result = await dispatch(createMedicao(medicao));

      if (createMedicao.fulfilled.match(result)) {
        const medicaoId = result.payload.id;

        await dispatch(
          createMultipleParametros({
            produtoId: medicao.produtoId,
            projetoId: medicao.projetoId,
            amostraId: medicao.amostraId,
            medicaoId,
          })
        );

        openSnackbar('Medição criada com sucesso!', 'success');
      } else {
        const errorMsg = result.payload as string;
        openSnackbar(errorMsg || 'Erro ao criar medição.', 'error');
      }
      setOpenModalCriarMedicao(false);
    } catch (error) {
      openSnackbar('Erro inesperado ao criar medição.', 'error');
    } finally {
      setAmostrasAtualizadas(true);
      dispatch(showProduct(product?.id));
    }
  };

  const handleAbrirAbaProjeto = async (row: Record<string, any>, amostrasProjeto: Amostra[]) => {
    const valorAba = `${row.id}`;

    const novaAba = {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>{row.numero}</span>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleFecharAba(valorAba);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      value: valorAba,
      content: (
        <Box>
          <Typography sx={{ marginBottom: '40px' }} variant="h5">
            {row.numero}
          </Typography>
          <Box>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box sx={{ minWidth: 300 }}>
                    <Typography variant="h5" gutterBottom>
                      Amostras:
                    </Typography>

                    {amostrasProjeto.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {amostrasProjeto.map((amostra) => (
                          <Chip
                            key={amostra.id}
                            label={amostra.codigo}
                            sx={{
                              backgroundColor:
                                amostrasSelecionadas[row.id]?.codigo === amostra.codigo
                                  ? 'primary.main'
                                  : 'white',
                              color:
                                amostrasSelecionadas[row.id]?.codigo === amostra.codigo
                                  ? 'white'
                                  : 'primary.main',

                              borderRadius: '4px',
                              height: '32px',
                              paddingX: '8px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setAmostrasSelecionadas((prev) => ({
                                ...prev,
                                [row.id]: {
                                  id: amostra.id,
                                  codigo: amostra.codigo,
                                  criadoEm: amostra.criadoEm,
                                  medicoes: amostra.medicoes,
                                },
                              }));
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">Nenhuma amostra adicionada</Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      minWidth: 180,
                    }}
                  >
                    <Button
                      sx={{ height: '50%', width: '170px' }}
                      variant="outlined"
                      size="large"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setOpenModalCriarAmostra(true);
                      }}
                    >
                      Add amostra
                    </Button>
                    <Button
                      sx={{ height: '50%', width: '170px', color: 'error.main' }}
                      variant="outlined"
                      size="large"
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                      onClick={() => {
                        setOpenModalDeletarAmostra(true);
                      }}
                      disabled={!amostrasSelecionadas[row.id]?.id}
                    >
                      Del amostra
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    marginTop: '20px',
                  }}
                >
                  <Box sx={{ minWidth: 300 }}>
                    <Typography variant="h5">Medições:</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      minWidth: 180,
                    }}
                  >
                    <Button
                      sx={{ height: '50%', width: '170px' }}
                      variant="outlined"
                      size="large"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setOpenModalCriarMedicao(true);
                      }}
                      disabled={!amostrasSelecionadas[row.id]?.id}
                    >
                      Add Medição
                    </Button>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)', // 2 colunas de tamanhos iguais
                  gap: 4,
                  marginTop: '30px',
                }}
              >
                {rowsMedicao.length > 0 ? (
                  rowsMedicao.map((m) => {
                    return (
                      <Box
                        key={m.id}
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="h6">
                            {m.tipoMedicao === 'ESFERA_INTEGRADORA'
                              ? 'Esfera Integradora'
                              : m.tipoMedicao === 'GONIOFOTOMETRO'
                                ? 'Goniofotômetro'
                                : m.tipoMedicao}
                          </Typography>

                          <Button
                            sx={{ height: '40px', width: '150px' }}
                            variant="outlined"
                            size="large"
                            startIcon={editModeMedicao[m.id] ? <SaveIcon /> : <EditIcon />}
                            onClick={() => handleEditMedicao(m as Medicao)}
                            disabled={algumEditando && !editModeMedicao[m.id]}
                          >
                            {editModeMedicao[m.id] ? 'Salvar' : 'Editar'}
                          </Button>
                          <Button
                            sx={{ height: '40px', width: '150px', color: 'error.main' }}
                            variant="outlined"
                            size="large"
                            onClick={() =>
                              setOpenModalDeletarMedicao({
                                open: true,
                                medicao: m as Medicao,
                              })
                            }
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                            Deletar
                          </Button>
                        </Box>
                        <Box>
                          <Typography variant="caption">
                            Criado em:{' '}
                            {m.criadoEm ? new Date(m.criadoEm).toLocaleDateString('pt-BR') : '-'}
                          </Typography>
                        </Box>

                        <ProductSpecificationTable
                          columns={[
                            { label: 'Parâmetro', key: 'parametro' },
                            { label: 'Valor', key: 'valor' },
                            { label: 'Unidade', key: 'unidade' },
                          ]}
                          rows={
                            rowsMedicao.find((medicao) => medicao.id === m.id)?.parametros || []
                          }
                          editMode={editModeMedicao[m.id] || false}
                          onChange={(novosParametros) => {
                            setRowsMedicao((prev) =>
                              prev.map((medicao) =>
                                medicao.id === m.id
                                  ? {
                                      ...medicao,
                                      parametros: novosParametros as ParametroProduto[],
                                    }
                                  : medicao
                              )
                            );
                          }}
                        />
                      </Box>
                    );
                  })
                ) : Object.keys(amostrasSelecionadas).length === 0 ? (
                  <Typography>Selecione uma amostra.</Typography>
                ) : (
                  <Typography>Não há medições.</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      ),
    };

    setAbaProjeto((prev) => {
      const existe = prev.find((aba) => aba.value === valorAba);
      if (existe) {
        return prev.map((aba) => (aba.value === valorAba ? novaAba : aba));
      } else {
        return [...prev, novaAba];
      }
    });
    setHistoricoAbas((prev) => {
      const novaLista = prev.filter((item) => item !== valorAba);
      return [...novaLista, valorAba];
    });

    setinitialSteateAba(valorAba);
  };

  const handleFecharAba = (value: string) => {
    // Remove a aba da lista de abas
    setAbaProjeto((prev) => prev.filter((tab) => tab.value !== value));

    // Atualiza o histórico de abas
    setHistoricoAbas((prev) => {
      const novoHistorico = prev.filter((item) => item !== value);

      // Pega o último projeto do histórico restante
      if (novoHistorico.length > 0) {
        const ultimoId = novoHistorico[novoHistorico.length - 1];

        // Aqui você converte para objeto Projeto
        const ultimoProjeto: Projeto = { id: ultimoId };

        if (
          initialSteateAba2 === historicoAbas[historicoAbas.length - 1] ||
          initialSteateAba === projetoSelecionado?.id
        ) {
          setProjetoSelecionado(ultimoProjeto);
          setinitialSteateAba2(ultimoProjeto.id);
          setinitialSteateAba(ultimoProjeto.id);
        } else {
          setinitialSteateAba('2');
          setinitialSteateAba2('2');
        }
      } else {
        setProjetoSelecionado(null);
        setinitialSteateAba('2');
        setinitialSteateAba2('2');
      }

      return novoHistorico;
    });
  };

  return (
    <DashboardContent>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        open={isRedirecting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 5,
        }}
      >
        <Typography variant="h4">{product.nome}</Typography>

        <Typography variant="h4" sx={{ color: 'text.secondary' }}>
          |
        </Typography>

        <Typography variant="h4">{product.referencia}</Typography>

        <Typography variant="h4" sx={{ color: 'text.secondary' }}>
          |
        </Typography>

        <Typography variant="h4">{product.tipo}</Typography>
      </Box>
      <Card>
        <ProductSpecificationTab
          initialValue={initialSteateAba}
          onChange={(initialSteateAba) => {
            setinitialSteateAba2(initialSteateAba);
          }}
          tabs={[
            {
              label: 'Especificações',
              value: '1',
              content: (
                <div>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h5"> Especificações:</Typography>
                      <Button
                        sx={{ height: '50%', width: '170px' }}
                        variant="outlined"
                        size="large"
                        startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                        onClick={handleToggleEdit}
                      >
                        {editMode ? 'Salvar' : 'Editar'}
                      </Button>
                    </Box>
                    <ProductSpecificationTable
                      columns={[
                        { label: 'Parâmetro', key: 'parametro' },
                        { label: 'Valor', key: 'valor' },
                        { label: 'Unidade', key: 'unidade' },
                      ]}
                      rows={rowsProduto}
                      editMode={editMode}
                      onChange={setRowsProduto}
                    />
                  </Box>
                </div>
              ),
            },
            {
              label: 'Projetos',
              value: '2',
              content: (
                <div>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h5">Projetos relacionados:</Typography>
                      <Button
                        sx={{ height: '50%', width: '170px' }}
                        variant="outlined"
                        size="large"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenModalForm}
                      >
                        Add Projeto
                      </Button>
                    </Box>
                    <GenericForm<ProjetoFormValues>
                      onSubmit={(data) => handleSubmitProject(product.id, data)}
                      open={OpenModalForm}
                      onClose={() => {
                        setOpenModalForm(false);
                        setProjetoParaEditar(null);
                      }}
                      title={projetoParaEditar ? 'Editar Projeto' : 'Criar Projeto'}
                      fields={formFields}
                      initialValues={projetoParaEditar ?? undefined}
                    />

                    {product.projetos.length > 0 ? (
                      <ProductSpecificationTable
                        columns={[
                          { label: 'Projeto', key: 'projeto' },
                          { label: 'Medição', key: 'medicao' },
                          { label: 'Criado em: ', key: 'criadoEm' },
                        ]}
                        rows={product.projetos.map((proj) => {
                          const tiposMedicao =
                            proj.amostras?.flatMap(
                              (amostra) => amostra.medicoes?.map((m) => m.tipoMedicao) || []
                            ) || [];

                          const nomesFormatados = [
                            ...new Set(
                              tiposMedicao.map((tipo) => {
                                if (tipo === 'ESFERA_INTEGRADORA') return 'Esfera';
                                if (tipo === 'GONIOFOTOMETRO') return 'Gônio';
                                return tipo;
                              })
                            ),
                          ];

                          return {
                            id: proj.id,
                            projeto: proj.numero,
                            medicao: nomesFormatados.length > 0 ? nomesFormatados.join(' / ') : '-',
                            criadoEm: proj.criadoEm
                              ? new Date(proj.criadoEm).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '-',
                          };
                        })}
                        showPopoverActions={true}
                        onEdit={handleEditProject}
                        onDelete={(row) => {
                          if (row.id) {
                            handleDeleteProject({
                              productId: product.id,
                              data: { projetoId: row.id },
                            });
                          } else {
                            openSnackbar('ID do projeto não encontrado.', 'error');
                          }
                        }}
                        onRowClick={(row) => {
                          setProjetoSelecionado({
                            id: row.id,
                            numero: row.projeto,
                          });
                        }}
                      />
                    ) : (
                      <Typography variant="body2">Nenhum projeto encontrado.</Typography>
                    )}
                  </Box>
                </div>
              ),
            },
            ...abaProjeto,
          ]}
        />
      </Card>
      <GenericForm<Amostra>
        onSubmit={(data) => handleCreateAmostra(data)}
        open={openModalCriarAmostra}
        onClose={() => setOpenModalCriarAmostra(false)}
        title="Criar amostra"
        fields={[
          {
            name: 'codigo',
            label: 'Identificação',
            required: true,
          },
        ]}
      />
      <GenericForm<{ tipoMedicao: string }>
        onSubmit={(data) => {
          handleCreateMedicao({
            produtoId: product.id,
            projetoId:
              initialSteateAba2 === '1' || initialSteateAba2 === '2'
                ? initialSteateAba
                : initialSteateAba2,
            amostraId:
              initialSteateAba2 === '1' || initialSteateAba2 === '2'
                ? (amostrasSelecionadas[initialSteateAba]?.id ?? '')
                : (amostrasSelecionadas[initialSteateAba2]?.id ?? ''),
            tipoMedicao: data.tipoMedicao,
          });
        }}
        open={openModalCriarMedicao}
        onClose={() => setOpenModalCriarMedicao(false)}
        title="Criar Medição"
        fields={[
          {
            name: 'tipoMedicao',
            label: 'Tipo de Medição',
            required: true,
            type: 'select',
            options: [
              { label: 'Esfera integradora', value: 'ESFERA_INTEGRADORA' },
              { label: 'Goniofotômetro', value: 'GONIOFOTOMETRO' },
            ],
          },
        ]}
        initialValues={{
          tipoMedicao: 'ESFERA_INTEGRADORA',
        }}
      />
      <Modal
        open={openModalDeletarAmostra}
        onClose={() => setOpenModalDeletarAmostra(false)}
        onConfirm={handleDeleteAmostra}
        title="Deletar amostra?"
        description="Tem certeza que deseja excluir a amostra ?"
        confirmText="Excluir"
        confirmColor="error"
      />
      <Modal
        open={openModalDeletarMedicao.open}
        onClose={() => setOpenModalDeletarMedicao({ open: false })}
        onConfirm={() => {
          if (openModalDeletarMedicao.medicao) {
            handleDeleteMedicao(openModalDeletarMedicao.medicao);
          }
          setOpenModalDeletarMedicao({ open: false });
        }}
        title="Deletar medição?"
        description={`Tem certeza que deseja excluir esta medição de ${
          openModalDeletarMedicao.medicao?.tipoMedicao === 'ESFERA_INTEGRADORA'
            ? 'Esfera Integradora'
            : openModalDeletarMedicao.medicao?.tipoMedicao === 'GONIOFOTOMETRO'
              ? 'Goniofotômetro'
              : openModalDeletarMedicao.medicao?.tipoMedicao
        }?`}
        confirmText="Excluir"
        confirmColor="error"
      />
    </DashboardContent>
  );
}
