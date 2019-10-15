import React, { Component } from 'react';
import Web3 from 'web3';
import Docu from '../abis/Docu.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'localhost', port: 5001, protocol: 'http' })

class App extends Component {

  async componentWillMount() {
    await this.activateWeb3()
    await this.getBlockchainData()
  }

  async activateWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async getBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Docu.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Docu.abi, networkData.address)
      this.setState({ contract })
      const DocuHash = await contract.methods.play().call()
      this.setState({ DocuHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      DocuHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      window.alert('buffer', this.state.buffer)
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    window.alert("Pushing to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs response', result)
      if(error) {
        console.error(error)
        return
      }
       this.state.contract.methods.record(result[0].hash).send({ from: this.state.account }).then((r) => {
         return this.setState({ DocuHash: result[0].hash })
       })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
           Upload digital assets
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`http://ipfs.io/ipfs/${this.state.DocuHash}`} />
                </a>
                <p>&nbsp;</p>
                <h2>Upload Assets</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
