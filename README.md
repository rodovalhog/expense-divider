# 💰 Divisor de Despesas (Expense Divider)

Uma aplicação moderna para gerenciamento e divisão de despesas financeiras, ideal para casais ou grupos que compartilham contas. 




![Preview] *(Imagem ilustrativa)*

<img width="1483" height="1323" alt="image" src="https://github.com/user-attachments/assets/8060f4ae-0b7a-4797-a1fc-67efbfbe8b6f" />

## ✨ Funcionalidades

### 📊 Gestão Completa
- **Dashboard Mensal**: Visualize seus gastos mês a mês com gráficos claros.
- **Resumo Anual Consolidado**: Veja o panorama completo do ano com média de gastos e distribuição por categoria.
- **Gráficos Interativos**: Gráficos de pizza para entender para onde seu dinheiro está indo.

### 📝 Controle de Transações
- **Importação de CSV**: Suporte nativo para faturas de cartão (testado com Nubank) e importação inteligente.
- **Despesas Recorrentes**: Cadastre gastos fixos uma vez e eles aparecerão automaticamente em todos os meses.
- **Edição em Massa**: Ao alterar a categoria de uma despesa, o sistema sugere atualizar todas as despesas similares (mesma descrição/ID) em todos os meses.
- **Exclusão Avançada**: Ignore pagamentos de fatura ou estornos do cálculo total, mantendo o histórico mas zerando o impacto na soma.

### 👤 Divisão e Renda
- **Donos da Despesa**: Marque cada gasto como "Eu", "Esposa/Marido" ou "Compartilhado".
- **Configuração de Renda**: Informe a renda de cada pessoa para cálculos futuros de divisão proporcional.

### 💾 Dados e Segurança
- **Persistência Local**: Todos os dados ficam salvos no seu navegador (LocalStorage). Nada vai para a nuvem sem você saber.
- **Backup e Restauração**: Exporte todos os seus dados em JSON para segurança.
- **Relatórios**: Exporte um relatório detalhado em CSV (Planilha) contendo todas as transações, categorias e totais.

## 🚀 Como Rodar o Projeto

Este é um projeto [Next.js](https://nextjs.org/).

### Pré-requisitos
- Node.js instalado.
- Gerenciador de pacotes `yarn` ou `npm`.

### Instalação

1. Clone o repositório ou entre na pasta:
```bash
cd expense-divider
```

2. Instale as dependências:
```bash
yarn install
# ou
npm install
```

3. Rode o servidor de desenvolvimento:
```bash
yarn dev
# ou
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🛠️ Tecnologias Utilizadas

- **[Next.js 14](https://nextjs.org/)**: Framework React moderno.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização rápida e responsiva.
- **[Lucide React](https://lucide.dev/)**: Ícones elegantes.
- **[Recharts](https://recharts.org/)**: Gráficos de dados.
- **[Papaparse](https://www.papaparse.com/)**: Processamento poderoso de arquivos CSV.
- **TypeScript**: Segurança e tipagem de código.
- **dnd-kit**: (Preparado para Drag and Drop de meses).

## 💡 Dicas de Uso

1. **Comece criando um mês**: Clique no "+" na barra superior.
2. **Importe sua fatura**: Arraste o arquivo CSV da sua fatura para a área pontilhada.
3. **Organize**: Use o botão de "olho" para ignorar pagamentos de fatura (elas não são gastos!).
4. **Padronize**: Ao mudar a categoria do "Uber", aceite a sugestão para mudar todos os "Ubers" do ano.
5. **Acompanhe**: Use o botão "Resumo Anual" para ver se você está gastando muito em "Lazer" este ano!
