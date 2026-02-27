# AutoPage Elite - Visão Geral do Produto

O **AutoPage Elite** é uma plataforma digital completa voltada para o setor automotivo (lojas de veículos e concessionárias). O sistema funciona com uma arquitetura "multi-tenant" (SaaS), o que significa que ele atende a múltiplas lojas independentes, mantendo os dados de cada uma isolados e seguros.

O produto é fundamentalmente dividido em duas grandes áreas: a **Vitrine Digital** (área pública para clientes) e o **CRM** (área restrita para gestão da loja).

---

## 1. Vitrine Digital (Frontend Público)
É o site que os clientes finais acessam para ver os carros à venda. Cada loja possui sua própria vitrine personalizada baseada no seu `store_id`.

**Principais Funcionalidades da Vitrine:**
*   **Mostruário de Veículos:** Exibe todo o estoque ativo da loja. Os clientes podem filtrar e visualizar detalhes como preço, ano, quilometragem, marca e modelo.
*   **Página de Detalhes do Veículo:** Mostra uma galeria de fotos do carro, especificações técnicas detalhadas, diferenciais gerados por Inteligência Artificial e a descrição principal do veículo.
*   **Captura de Leads (Interesse):** Em cada página de veículo e na página inicial, existem formulários onde o cliente pode demonstrar interesse, inserindo nome, telefone (WhatsApp) e mensagem. Essa ação envia o lead diretamente para o CRM da loja.
*   **Personalização:** A vitrine reflete a identidade visual da loja, incluindo o Nome da Marca, a Cor Principal (usada em botões e destaques), e chamadas (Hero Title e textos de boas-vindas).
*   **Integração com Redes Sociais e Contato:** Botões flutuantes e links que direcionam o cliente diretamente para o WhatsApp ou Instagram da loja.

---

## 2. CRM de Gestão Automotiva (Área Restrita)
É o painel administrativo acessado apenas pelos donos e vendedores da loja (mediante login e senha). Aqui é onde a magia acontece e a loja é operada.

**Módulos do CRM:**

### 📊 Dashboard
Painel principal que fornece estatísticas rápidas sobre a operação:
*   Total de veículos no estoque.
*   Quantidade de leads recebidos.
*   Taxas de conversão ou vendas concluídas.

### 🚗 Gestor de Estoque / Cadastros
Onde os veículos são inseridos no sistema.
*   **Upload de Imagens:** Suporte para adicionar múltiplas fotos por veículo (armazenadas na nuvem via Supabase).
*   **Inteligência Artificial (Google Gemini):** Com o clique de um botão, o sistema analisa os dados primários do carro e **cria automaticamente** a descrição comercial, os diferenciais atrativos e sugere preços baseados em anúncios otimizados.
*   Controle de visibilidade (ex: marcar um veículo como "Destaque" ou "Vendido/Inativo").

### 👥 Gestor de Leads
Lista centralizada de todas as pessoas que entraram em contato interessadas em algum carro.
*   Permite ver de qual carro o cliente veio ou adicionar leads manualmente (ex: cliente que ligou direto na loja).
*   Acompanhamento e alteração de status.

### 🎯 Funil de Vendas (Kanban)
Uma visualização em painel do Gestor de Leads.
*   Permite arrastar os clientes por diferentes etapas da jornada de compra: Novo Lead $\rightarrow$ Em Atendimento $\rightarrow$ Negociação $\rightarrow$ Venda Feita ou Perdida.
*   Ajuda a loja a não perder nenhuma oportunidade por falta de acompanhamento (follow-up).

### ⚙️ Configurações da Loja Virtual
Onde o administrador customiza a aparência da "Vitrine Digital".
*   Definição de Cores, Nome da Marca, WhatsApp e links.
*   Possui também a Integração com IA para gerar "Textos de Apresentação" bonitos e persuasivos para a loja.

### 🔐 Gestão de Usuários
Controle de equipe para lojas maiores.
*   Permite que o dono da loja (Admin) crie acessos para seus vendedores (Standard User).
*   Todos operam na mesma base de dados da loja, mas com permissões diferentes (futuramente customizáveis).

---

## Diferenciais Técnicos e Competitivos do Produto

1.  **Geração Rápida de Anúncios com IA:** Reduz drasticamente o tempo que o lojista gasta pensando no que escrever sobre o carro. O sistema faz textos persuasivos no formato de anúncios do setor automotivo moderno.
2.  **Isolamento de Dados (RLS):** Garantia técnica de que um lojista jamais verá os carros, leads ou estatísticas de outro lojista, devido às rigorosas políticas de segurança (Row Level Security) implantadas no banco de dados.
3.  **Modernidade e Fluidez:** Interface extremamente rápida e visualmente atrativa (Dark Mode imersivo, animações fluidas) que dá um aspecto *Premium* tanto para a loja que o utiliza, quanto para o cliente final que compra o veículo.
4.  **Hospedagem em Nuvem Escalável:** Hospedado na Vercel com banco de dados Supabase, o sistema está pronto para atender desde uma loja pequena com 10 carros até grandes feirões com milhares de acessos simultâneos sem cair.
