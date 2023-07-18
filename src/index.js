const inquirer = require("inquirer");
const fs = require("fs");

console.log("accounts is started ...");

const operation = () => {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "Oque você deseja fazer ? ",
      choices: ["Criar Conta", "Consultar Saldo", "Depositar", "Sacar", "Sair"],
    })
    .then((answer) => {
      let action = "";
      action = answer["action"];
      console.log("action -->", action);
      if (action === "Criar Conta") {
        console.log("Bem vindo ao criador de contas do Accounts!!");
        buildAccount();
      }
      if (action === "Consultar Saldo") {
        balance();
      }
      if (action === "Depositar") {
        deposit();
      }
      if (action === "Sacar") {
        withdraw();
      }
      if (action === "Sair") {
        console.log("Obrigado por usar o accounts !!");
        timerToCall(process.exit);
        return;
      }
    })
    .catch((err) => console.log(err));
};

const buildAccount = () => {
  inquirer
    .prompt([{ name: "accountName", message: "Digite o nome da sua conta: " }])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info("nome da conta é :", accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log("o nome da usuário ja existe, escolha outro!");
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        (err) => {
          console.log(err);
        }
      );

      console.log("Parabéns sua conta foi criada!!");

      timerToCall(operation);
    })
    .catch((err) => console.log(err));
};

const deposit = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Nome da conta para deposito :",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!existsAccount(accountName)) {
        console.log("Conta inexistente!!");
        timerToCall(operation);
        return;
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Valor de deposito: R$ ",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          addAmount(accountName, amount);
          timerToCall(operation);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const balance = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite a conta para obter o saldo ",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!existsAccount(accountName)) {
        console.log("Conta inválida!! ");
        timerToCall(operation);
        return;
      }

      const balance = getBalance(accountName);
      console.log("seu saldo em conta é :R$", balance);
      timerToCall(operation);
    })
    .catch((err) => console.log(err));
};

const withdraw = () => {
  inquirer
    .prompt([{ name: "accountName", message: "Nome da conta para saque: " }])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!existsAccount(accountName)) {
        console.log("conta inexistente !!");
        timerToCall(operation);
        return;
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Valor para saque",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          withdrawAmount(amount, accountName);
          timerToCall(operation);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const timerToCall = (callback) => {
  setTimeout(callback, 3000);
};

const existsAccount = (accountName) => {
  return fs.existsSync(`accounts/${accountName}.json`, (err) =>
    console.log(err)
  );
};

const addAmount = (accountName, amount) => {
  if (amount <= 0) {
    console.log("Valor invalido, tente novamente mais tarde!!");
    timerToCall(operation);
    return;
  }
  const accountData = getAccount(accountName);
  accountData.balance = parseFloat(accountData.balance) + parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(
    `Deposito de R$ ${amount} realizado com sucesso na conta ${accountName}`
  );
};

const getAccount = (accountName) => {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
};
const getBalance = (accountName) => {
  const accountData = getAccount(accountName);
  return accountData.balance;
};

const withdrawAmount = (amount, accountName) => {
  if (amount <= 0) {
    console.log("Valor inválido");
    timerToCall(operation);
    return;
  }

  const accountData = getAccount(accountName);

  if (parseFloat(accountData.balance) < parseFloat(amount)) {
    console.log("Saldo em conta insuficiente !!");
    timerToCall(operation);
    return;
  }

  const newAccountData = accountData;
  newAccountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(newAccountData),
    (err) => console.log(err)
  );

  console.log(`Saque de R$ ${amount} realizado com sucesso`);
};

operation();
