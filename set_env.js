const { exec } = require('child_process');
const replace = require('replace-in-file');
const args = process.argv.slice(2);

exec(
  `az storage account keys list -g ${args[0]} -n ${args[1]}`,
  (error, stdout, stderr) => {
    const keyObj = JSON.parse(stdout);
    const azureStorageAccountAccessKey = keyObj[0].value;
    replace.sync({
      files: ['./.env', './deployment.json'],
      from: ['azureStorageAccountAccessKey=', '$azureStorageAccountAccessKey'],
      to: [
        `azureStorageAccountAccessKey=${azureStorageAccountAccessKey.toString()}`,
        azureStorageAccountAccessKey.toString()
      ]
    });
  }
);

exec(
  `az iot hub show --query properties.eventHubEndpoints.events.path --name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: ['./.env', './deployment.json'],
      from: ['eventHubsCompatiblePath=', '$eventHubsCompatiblePath'],
      to: [
        `eventHubsCompatiblePath=${stdout.slice(1, stdout.length - 2)}`,
        stdout.slice(1, stdout.length - 2)
      ]
    });
  }
);

exec(
  `az iot hub show --query properties.eventHubEndpoints.events.endpoint --name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: ['./.env', './deployment.json'],
      from: ['eventHubsCompatibleEndpoint=', '$eventHubsCompatibleEndpoint'],
      to: [
        `eventHubsCompatibleEndpoint=${stdout.slice(1, stdout.length - 3)}`,
        stdout.slice(1, stdout.length - 3)
      ]
    });
  }
);

exec(
  `az iot hub policy show --name service --query primaryKey --hub-name ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: ['./.env', './deployment.json'],
      from: ['iotHubSasKey=', '$iotHubSasKey'],
      to: [
        `iotHubSasKey=${stdout.slice(1, stdout.length - 2)}`,
        stdout.slice(1, stdout.length - 2)
      ]
    });
  }
);

exec(
  `az iot hub device-identity connection-string show -d ${args[3]} -n ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: ['./.env', './deployment.json'],
      from: ['deviceConnectionString=', '$deviceConnectionString'],
      to: [
        `deviceConnectionString=${JSON.parse(stdout).connectionString}`,
        JSON.parse(stdout).connectionString
      ]
    });
  }
);

exec(
  `az iot hub device-identity connection-string show -d ${args[6]} -n ${args[2]}`,
  (error, stdout, stderr) => {
    replace.sync({
      files: './config.yaml',
      from: '<connection-string>',
      to: JSON.parse(stdout).connectionString
    });
  }
);

exec(
  `az cosmosdb keys list --type connection-strings -g ${args[0]} -n ${args[4]}`,
  (error, stdout, stderr) => {
    const jsonObj = JSON.parse(stdout);
    replace.sync({
      files: './.env',
      from: 'cosmosConnectionString=',
      to: `cosmosConnectionString=${jsonObj.connectionStrings[0].connectionString}`
    });
  }
);

exec(
  `az vm show -d -g ${args[0]} -n ${args[5]} --query publicIps -o tsv`,
  (error, stdout, stderr) => {
    var url = `http://${stdout}`;
    replace.sync({
      files: './.env',
      from: 'API_URL=',
      to: `API_URL=${url}`
    });
  }
);

exec(`az acr credential show -n ${args[7]}`, (error, stdout, stderr) => {
  const acrJson = JSON.parse(stdout);
  replace.sync({
    files: './deployment.json',
    from: [
      '<ACR-username>',
      '<ACR-address>',
      '$CONTAINER_REGISTRY_USERNAME',
      '$CONTAINER_REGISTRY_PASSWORD'
    ],
    to: [
      acrJson.username,
      acrJson.username.toLowerCase(),
      acrJson.username,
      acrJson.passwords[0].value
    ]
  });
});

replace.sync({
  files: ['./.env', './deployment.json'],
  from: ['azureStorageAccountName=', '$azureStorageAccountName'],
  to: [`azureStorageAccountName=${args[1]}`, args[1]]
});
