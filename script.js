const taskInput   = document.getElementById('taskInput');
const addBtn      = document.getElementById('addBtn');
const taskList    = document.getElementById('taskList');
const taskCount   = document.getElementById('taskCount');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const filterBtns  = document.querySelectorAll('.filter-btn');

let tasks = [];          
let currentFilter = 'all'; 

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Carrega tarefas salvas (chamada uma vez ao iniciar)
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  // Se existir algo salvo, faz parse (converte de string para array)
  tasks = saved ? JSON.parse(saved) : [];
}

function render() {
  // Filtra as tarefas conforme o filtro ativo
  const filtered = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.done;
    if (currentFilter === 'done')    return task.done;
    return true; // 'all' — mostra tudo
  });

  // Limpa a lista antes de redesenhar
  taskList.innerHTML = '';

  // Se não há tarefas para exibir, mostra mensagem
  if (filtered.length === 0) {
    taskList.innerHTML = '<p class="empty-msg">Nenhuma tarefa aqui 👌</p>';
  } else {
    // Cria um <li> para cada tarefa filtrada
    filtered.forEach(task => {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    });
  }

  // Atualiza o contador de pendentes no rodapé
  updateCount();
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (task.done) li.classList.add('done'); // Adiciona classe se concluída

  // innerHTML com template literal — estrutura do item
  li.innerHTML = `
    <input 
      type="checkbox" 
      class="task-check" 
      ${task.done ? 'checked' : ''}
      aria-label="Marcar tarefa como concluída"
    />
    <span class="task-text">${escapeHTML(task.text)}</span>
    <button class="delete-btn" aria-label="Deletar tarefa">✕</button>
  `;

  // Evento: marcar/desmarcar tarefa
  const checkbox = li.querySelector('.task-check');
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Evento: deletar tarefa
  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return li;
}

// ============================
// ADICIONAR TAREFA
// Lê o valor do input, valida e cria o objeto.
// =============================
function addTask() {
  const text = taskInput.value.trim(); // Remove espaços extras

  // Não adiciona se o campo estiver vazio
  if (!text) {
    taskInput.focus();
    return;
  }

  // Cria o objeto da nova tarefa
  const newTask = {
    id: Date.now(),   // ID único usando timestamp
    text: text,
    done: false
  };

  tasks.push(newTask); // Adiciona ao array
  saveTasks();         // Salva no localStorage
  render();            // Re-renderiza a lista

  // Limpa e foca no input para a próxima tarefa
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  // .find() retorna a tarefa com aquele id
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done; // Inverte true/false
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  // .filter() retorna um novo array SEM o item deletado
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// =============================================
// LIMPAR CONCLUÍDAS
// Remove todas as tarefas com done === true
// =============================================
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// =============================================
// ATUALIZAR CONTADOR
// Conta quantas tarefas estão pendentes
// =============================================
function updateCount() {
  const pending = tasks.filter(t => !t.done).length;
  const word = pending === 1 ? 'tarefa pendente' : 'tarefas pendentes';
  taskCount.textContent = `${pending} ${word}`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

addBtn.addEventListener('click', addTask);

// Pressionar Enter no input também adiciona
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// Clique nos botões de filtro
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove classe 'active' de todos os botões
    filterBtns.forEach(b => b.classList.remove('active'));
    // Adiciona 'active' no botão clicado
    btn.classList.add('active');
    // Atualiza o filtro e re-renderiza
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clique em "Limpar concluídas"
clearDoneBtn.addEventListener('click', clearDone);


loadTasks(); // Carrega dados salvos
render();    // Desenha a lista na tela
