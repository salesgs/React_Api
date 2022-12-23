import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { 
  Grid,
  Button,
  TextField, 
  Tab, 
  Tooltip, 
  CircularProgress,
} from '@mui/material'
import { TabPanel, TabList, TabContext } from '@mui/lab'
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios'

import './App.css'

function App() {

  const [ abaAtual, setAbaAtual ] = useState('get-all-clientes')
  const [ linhas, setLinhas ] = useState([])
  const [ camposParams, setCamposParams ] = useState({ id: '', cpf: '', email: '',nome:'' })
  const [ carregandoRequisicao, setCarregandoRequisicao ] = useState(false)


  const mostrarModal = (carregando) => {
    setCarregandoRequisicao(carregando)
  }


  const mudarDeAba = (evento, value) => {
    setLinhas([])
    setAbaAtual(value)
    setCamposParams({ id: '', cpf: '', email: '',nome:'' })
  }

  const requisicao = async (
    metodo, 
    parametros, 
    caminho, 
    valoresParametros
  ) => {

    let resposta

    if ((metodo === 'POST' || metodo === 'PUT') && (valoresParametros.cpf === '' || valoresParametros.email === '')) return alert("Os campos 'nome' e 'email' precisam ser preenchidos!")
    if((metodo==='POST' || metodo==='PUT') && (valoresParametros.nome==='')) return alert("O campo 'nome'  precisa ser preenchido!")
    if (caminho.includes('id') && valoresParametros.id === '') return alert("O campo 'id' precisa ser preenchido para essa requisição!")

    let corpo = {}
    parametros.forEach(parametro => {
      if (parametro.type === 'Path') caminho = caminho.replace(parametro.name, valoresParametros[parametro.name])
      if (parametro.type === 'Body') corpo[parametro.name] = valoresParametros[parametro.name]
    })

    try {
      resposta = await axios({method: metodo, url:`http://localhost:7227/api${caminho}`, data: corpo})

    } catch (e) {
      setCarregandoRequisicao(false)
      return alert('Requisição não concluída ou retornou um erro.\n' + e)
    }


    let clientes = []
    if(resposta.data.length > 0) {
      clientes = resposta.data.map(cliente => {
        return {
          id: cliente.id,
          cpf: cliente.cpf,
          email: cliente.email,
          nome: cliente.nome
        }
      }) 
      setLinhas(clientes)

    } else if (resposta.data.id) {
      clientes[0] = {
        id: resposta.data.id,
        cpf: resposta.data.cpf,
        email: resposta.data.email,
        nome: resposta.data.nome
      }
      setLinhas(clientes)

    } else if (resposta.data.deleted) {
      alert('Registro deletado com sucesso!')

    }
  }



  const colunas = [
    { field: 'id', headerName: 'Id', width: 130 },
    { field: 'cpf', headerName: 'CPF', width: 130 },
    { field: 'email', headerName: 'EMAIL', width: 130 },
    { field: 'nome', headerName: 'NOME', width: 130 },
  ]

  const endpoints = [
    {
      title: 'Pegar Todos os Clientes',
      method: 'GET',
      params: [],
      returnType: 'Retornar uma lista de objetos de Cliente.',
      path: '/api/clientes',
      value: 'get-all-clientes',
     
    },
    {
      title: 'Pegar Cliente pelo Id',
      method: 'GET',
      params: [
        { 
          name:'id', 
          type: 'Path', 
          valueType: 'number', 
          required: true,
          obs: 'Para pegar um cliente, deve-se preencher o id'
        },
      ],
      returnType: 'Retornar um único objeto de Cliente.',
      path: '/api/clientes/id',
      value: 'get-cliente-by-id',
      
    },
    {
      title: 'Cadastrar um Cliente',
      method: 'POST',
      params: [
        { 
          name:'cpf', 
          type: 'Body', 
          valueType: 'number', 
          required: true,
          obs: 'CPF completo do Cliente'
        },
        { 
          name:'email', 
          type: 'Body', 
          valueType: 'string', 
          required: true,
          obs: 'Email do Cliente'
        },
        { 
          name:'nome', 
          type: 'Body', 
          valueType: 'string', 
          required: true,
          obs: 'Nome do Cliente'
        },
      ],
      returnType: 'Cadastrar e retornar o novo objeto de Cliente.',
      path: '/api/clientes',
      value: 'create-cliente',
      
    },
    {
      title: 'Alterar um Cliente',
      method: 'PUT',
      params: [
        { 
          name:'cpf', 
          type: 'Body', 
          valueType: 'number', 
          required: true,
          obs: 'CPF completo do Cliente'
        },
        { 
          name:'email', 
          type: 'Body', 
          valueType: 'string', 
          required: true,
          obs: 'Email do Cliente'
        },
        { 
          name:'nome', 
          type: 'Body', 
          valueType: 'string', 
          required: true,
          obs: 'Nome do Cliente'
        },
        { 
          name:'id', 
          type: 'Path', 
          valueType: 'number', 
          required: true,
          obs: 'Id do Jogo que irá receber novos dados'
        },
      ],
      returnType: 'Alterar retornar o objeto de Cliente com os novos dados.',
      path: '/api/clientes/id',
      value: 'update-cliente',
      
    },
    {
      title: 'Deletar Cliente pelo Id',
      method: 'DELETE',
      params: [
        { 
          name:'id', 
          type: 'Path', 
          valueType: 'number', 
          required: true,
          obs: 'Para deletar um Cliente, deve-se preencher o id'
        },
      ],
      returnType: 'Retorna um booleano informando se o Cliente foi deletado.',
      path: '/api/clientes/id',
      value: 'delete-cliente-by-id',
    },
  ]

  return (
    <div className='App'>
     {!!carregandoRequisicao && 
     <Grid 
       style={{
         position: 'fixed',
         top: '50%',
         right: 0,
         bottom: 0,
         left: 0,
         zIndex: 1,
      }}><CircularProgress />
      <br />
      <strong>Por favor, aguarde...</strong>
     </Grid>}
     <Grid id='grid-main-content'>
      <TabContext value={abaAtual}>
        <TabList onChange={mudarDeAba}>
          {endpoints.map((endpoint, index) =>
            <Tab 
              key={index}
              style={{ outline: 'none' }} 
              label={endpoint.title} 
              value={endpoint.value}
            >
            </Tab>
          )}
          
        </TabList>
        <TabPanel value={abaAtual}>
          {endpoints.map((endpoint, index) => {
            if(abaAtual === endpoint.value) {
              return(
                <Grid style={{ textAlign: 'left', color: endpoint.color }} key={index}>
                  <h2>Título: {endpoint.title}</h2>
                  <h3>Método: {endpoint.method}</h3>
                  <h3>Objetivo: {endpoint.returnType}</h3>
                  <h3>Caminho do endpoint: {endpoint.path}</h3>
                  {!!endpoint.params.length && <h3>Parametros:</h3>}
                  <ul>
                    {endpoint.params.map((param, index) =>
                      <Grid className='params' style={{ color: 'black', borderColor: endpoint.color }} key={index}>
                        <li><strong>Nome:</strong> {param.name}</li>
                        <li><strong>Tipo do parâmetro:</strong>{param.type}</li>
                        <li><strong>Tipo de valor:</strong>{param.valueType}</li>
                        <li><strong>Obrigatório:</strong>{param.required ? 'SIM' : 'NÃO'}</li>
                        <li><strong>Observação:</strong> {param.obs}</li>
                        <TextField
                          style={{ marginBottom: '3rem' }}
                          onKeyUp={evento => {
                            setCamposParams({...camposParams, [param.name]: evento.target.value})}
                          } 
                          label={param.name} 
                          variant='filled' 
                        />
                      </Grid>
                    )}
                  </ul>
                  <Tooltip title={ 'Enviar requisição ao endpoint ' + endpoint.path } arrow>
                    <Button 
                      style={{
                        outline: 'none',
                        fontWeight: 'bold'
                      }}
                      variant='contained'
                      onClick={async () => {
                        document.getElementById('grid-main-content').style.opacity = '0.5'
                        mostrarModal(true)
                        await requisicao(endpoint.method, endpoint.params, endpoint.path, camposParams)
                        mostrarModal(false)
                        document.getElementById('grid-main-content').style.opacity = '1'
                      }}
                    >
                      Enviar Requisição
                    </Button>
                  </Tooltip>
                </Grid>
              )
            }
          })}
          </TabPanel>
      </TabContext>
      <h2>Resultado</h2>
      {!!linhas.length && <DataGrid
        style={{ height: 400, width: '100%' }}
        rows={linhas}
        columns={colunas}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
      />}
     </Grid>
    </div>
  )
}

export default App
