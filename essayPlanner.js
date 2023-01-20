const container = document.querySelector('#container');
const addInput = document.querySelector('.to-add');
const addButton  = document.querySelector('.add');
const pointList = document.querySelector('.point-list ul');
const clearButton = document.querySelector('.clear');
const questionPanelTemplate = document.querySelector('template.question-panel');
const questionTemplate = document.querySelector('template.question');
const questionPanels = document.querySelector('ul.question-panels');
const questions = ['What', 'Why', 'Who', 'How', 'When', 'Where'];
let items = {};

class JsonHandler {
  addItem(e) {
    console.log(`jsonHandler adding`);
  }

  clearItems(e) {
    console.log(`jsonHandler clearing`);
  }

  handleListClick(e) {
    console.log(`jsonHandler handling list click`);
  }

  handleInputClick(e) {
    console.log(`jsonHandler handling input click`);
  }
}

class ListHandler {
  addItem(e) {
    console.log(`listHandler adding`);
  }

  clearItems(e) {
    console.log(`listHandler clearing`);
  }

  handleListClick(e) {
    console.log(`listHandler handling list click`);
  }

  handleInputClick(e) {
    console.log(`listHandler handling input click`);
  }
}

class InputHandler  {
  addItem(e) {
    console.log(`inputHandler adding`);
  }

  clearItems(e) {
    console.log(`inputHandler clearing`);
  }

  handleListClick(e) {
    console.log(`inputHandler handling list click`);
  }

  handleInputClick(e) {
    console.log(`inputHandler handling input click`);
  }
}

function init() {
  const handlers = [
    new JsonHandler(),
    new ListHandler(),
    new InputHandler()
  ];

  const abc = {
    'button.add': (handler, e) => handler.addItem(e),
    'button.clear': (handler, e) => handler.clearItems(e),
    'section.point-list': (handler, e) => handler.handleListClick(e),
    'section.question-input': (handler, e) => handler.handleInputClick(e),
  }

  Object.keys(abc).forEach(querySelector => {
    handlers.forEach(handler => {
      const element = document.querySelector(querySelector);
      element.addEventListener('click', e => {
        abc[querySelector](handler, e);
      })
    })
  })
}


init();

addButton.addEventListener('click', addItem);
clearButton.addEventListener('click', clearItems);
pointList.addEventListener('click', handlePointlistClick);
questionPanels.addEventListener('click',  handleQuestionPanelClick);

function addItem(e) {
  const entry = addInput.value;
  addInput.value = "";
  
  if (!entry) return;
  if (entry in items) return;
  // provide feedback?
  
  items[entry] = { entry: entry };
  
  const item = document.createElement('li');
  item.innerText = entry;
  item.classList.add('panel-trigger');
  pointList.appendChild(item);
}

function clearItems(e) {
  pointList.innerHTML = '';
}

function handlePointlistClick(e) {  
    const target = e.target;
    if (!target.classList.contains('panel-trigger')) return;

    const title = target.innerText;
    const panel = createQuestionPanel(title, title, 1);

    if (panel.isNew) {
        questionPanels.appendChild(panel.payload);
    } else {
        panel.payload.classList.remove('hidden');
    }
}

function handleQuestionPanelClick(e) {
  const target = e.target;
  
  // expand
  if (target.classList.contains('panel-trigger')) {
    const question = target.closest('.question');
    const input = question.querySelector('input');
    const key = input.dataset.question;
    const title = input.value;
    
    if (!title) return;
    
    const panelWrapper = question.closest('.question-panel-wrapper');
    
    const level = panelWrapper.dataset.level;
    const levelInt = Number(level);
    
    const childPanel = createQuestionPanel(title, key, levelInt + 1);    
    if (childPanel.isNew) {
        panelWrapper.appendChild(childPanel.payload);
    } else {
        childPanel.payload.classList.remove('hidden');
    }
  }
  
  // close
  if (target.classList.contains('close')) {
    closeQuestionPanel(target);
  }
}

function createQuestionPanel(title, key, level) { 
  const existingPanel = questionPanels.querySelector(`[data-title="${title}"]`);
  
  if (existingPanel) {
    return {
        isNew: false,
        payload: existingPanel
    };
  }
  
  const template = questionPanelTemplate.content.cloneNode(true);
  const panelWrapper = template.querySelector('.question-panel-wrapper');
  const panelTail = panelWrapper.querySelector('.panel-tail');
  const titleElement = panelWrapper.querySelector('.question-panel-title');
  const panelList = panelWrapper.querySelector('ul');
  
  panelWrapper.dataset.title = title;
  panelWrapper.dataset.key = key;
  panelWrapper.dataset.level = level
  titleElement.innerText = title;
  
  if (level === 1) {
    panelTail.classList.add('hidden');
  }
  
  questions.forEach(question => {
    const template = questionTemplate.content.cloneNode(true);

    const questionElement = template.querySelector('.question');
    const input = questionElement.querySelector('input');
    input.dataset.question = question;
    input.placeholder = `${question}?`;
    
    panelList.appendChild(questionElement);
  });
  
  return {
    isNew: true,
    payload: panelWrapper
  }
}

function closeQuestionPanel(closeButton) {  
  const panelWrapper = closeButton.closest('.question-panel-wrapper');
  assembleQuestionHierarchy(panelWrapper);
  
  // hide
  panelWrapper.classList.add('hidden');
}

function assembleQuestionHierarchy(panelWrapper) {
  const title = panelWrapper.dataset.title;

  const questionPanel = panelWrapper.querySelector('.question-panel');
  const json = extractJsonFromWrapper(title, questionPanel);

  const childPanelWrapper = panelWrapper.querySelector('.question-panel-wrapper');
  if (!childPanelWrapper) return json; 

  const key = childPanelWrapper.dataset.key;
  
  const result = { 
    ...json, 
    [key]: {
        ...json[key],
        ...assembleQuestionHierarchy(childPanelWrapper) 
    } 
  };
  
  console.log(result);
 
  return result;
}
  
function extractJsonFromWrapper(title, questionPanel) {
  const questionInputs = [...questionPanel.querySelectorAll('.question input')];
  
  const questions = questionInputs
    .filter(input => input.value)
    .map(input => ({ 
        [input.dataset.question]: { title: input.value } 
    }))
    .reduce((acc, el) => ({...acc, ...el }), {});
  
  return { ...questions, title: title };
}
  
  