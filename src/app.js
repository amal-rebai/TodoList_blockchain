App = {
  loading: false,
  contracts: {},
  account: '',

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }

    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        // Accounts now exposed
        web3.eth.defaultAccount = accounts[0];
      } catch (error) {
        // User denied account access...
        console.error(error);
      }
    }
    
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    const accounts = await web3.eth.getAccounts();
    App.account = accounts[0];
    console.log('Account: ',App.account)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json');
    App.contracts.TodoList = TruffleContract(todoList);
    console.log('Contract: ',App.contracts.TodoList)
    App.contracts.TodoList.setProvider(web3.currentProvider);
  
    // Replace the event listener
    web3.currentProvider.on('disconnect', () => App.setLoading(false));
  
    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed();
    console.log('To do list: ',App.todoList)
  },
  

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }

    // Update app loading state
    App.setLoading(true);

    // Render Account
    $('#account').html(App.account);

    // Render Tasks
    await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $('.taskTemplate');

    // Render out each task with a new task template
    for (let i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find('.content').html(taskContent);
      $newTaskTemplate.find('input')
        .prop('name', taskId)
        .prop('checked', taskCompleted)
        .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate);
      } else {
        $('#taskList').append($newTaskTemplate);
      }

      // Show the task
      $newTaskTemplate.show();
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $('#newTask').val();
    const from = App.account;
    await App.todoList.createTask(content, { from });
    window.location.reload();
  },
  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId, { from: App.account })
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $('#loader');
    const content = $('#content');
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  }
};

$(() => {
  $(window).on('load', () => {
    App.load();
  });
});









// App = {
//   loading: false,
//   contracts: {},

//   load: async () => {
//     await App.loadWeb3()
//     await App.loadAccount()
//     await App.loadContract()
//     await App.render()
//   },

//   loadWeb3: async () => {
//     if (typeof web3 !== 'undefined') {
//       web3 = new Web3(web3.currentProvider);
//     } else {
//       window.alert("Please connect to Metamask.");
//     }

//     // Modern dapp browsers...
//     if (window.ethereum) {
//       window.web3 = new Web3(ethereum);
//       try {
//         // Request account access if needed
//         const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//         // Accounts now exposed
//         web3.eth.defaultAccount = accounts[0];
//       } catch (error) {
//         // User denied account access...
//         console.error(error);
//       }
//     }
    
//     // Legacy dapp browsers...
//     else if (window.web3) {
//       window.web3 = new Web3(web3.currentProvider);
//     }
//     // Non-dapp browsers...
//     else {
//       console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
//     }
//   },


//   loadAccount: async () => {
//     // Set the current blockchain account
//     App.account = web3.eth.accounts[0]
//     console.log(App.account)
//   },

//   loadContract: async () => {
//     // Create a JavaScript version of the smart contract
//     const todoList = await $.getJSON('TodoList.json')
//     console.log(todoList)
//     App.contracts.TodoList = TruffleContract(todoList)
//     App.contracts.TodoList.setProvider(App.web3Provider)

//     // Hydrate the smart contract with values from the blockchain
//     App.todoList = await App.contracts.TodoList.deployed()
//   },

//   render: async () => {
//     // Prevent double render
//     if (App.loading) {
//       return
//     }

//     // Update app loading state
//     App.setLoading(true)

//     // Render Account
//     $('#account').html(App.account)

//     // Render Tasks
//     await App.renderTasks()

//     // Update loading state
//     App.setLoading(false)
//   },

//   renderTasks: async () => {
//     // Load the total task count from the blockchain
//     const taskCount = await App.todoList.taskCount()
//     const $taskTemplate = $('.taskTemplate')

//     // Render out each task with a new task template
//     for (var i = 1; i <= taskCount; i++) {
//       // Fetch the task data from the blockchain
//       const task = await App.todoList.tasks(i)
//       const taskId = task[0].toNumber()
//       const taskContent = task[1]
//       const taskCompleted = task[2]

//       // Create the html for the task
//       const $newTaskTemplate = $taskTemplate.clone()
//       $newTaskTemplate.find('.content').html(taskContent)
//       $newTaskTemplate.find('input')
//                       .prop('name', taskId)
//                       .prop('checked', taskCompleted)
//                       // .on('click', App.toggleCompleted)

//       // Put the task in the correct list
//       if (taskCompleted) {
//         $('#completedTaskList').append($newTaskTemplate)
//       } else {
//         $('#taskList').append($newTaskTemplate)
//       }

//       // Show the task
//       $newTaskTemplate.show()
//     }
//   },

//   setLoading: (boolean) => {
//     App.loading = boolean
//     const loader = $('#loader')
//     const content = $('#content')
//     if (boolean) {
//       loader.show()
//       content.hide()
//     } else {
//       loader.hide()
//       content.show()
//     }
//   }
// }

// $(() => {
//   $(window).load(() => {
//     App.load()
//   })
// })