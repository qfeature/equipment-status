import dateFormat from 'dateformat'
import { History } from 'history'
//import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  //Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Dropdown,
  Label
} from 'semantic-ui-react'

import { createEquipment, deleteEquipment, getEquipmentList /*, patchEquipment*/ } from '../api/equipmentList-api'
import Auth from '../auth/Auth'
import { Equipment } from '../types/Equipment'

interface EquipmentListProps {
  auth: Auth
  history: History
}

interface EquipmentListState {
  equipmentList: Equipment[]
  newEquipmentName: string
  newEquipmentStatus: string
  loadingEquipmentList: boolean
}

export class EquipmentList extends React.PureComponent<EquipmentListProps, EquipmentListState> {
  state: EquipmentListState = {
    equipmentList: [],
    newEquipmentName: '',
    newEquipmentStatus: 'Up',
    loadingEquipmentList: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEquipmentName: event.target.value })
  }

  handleStatusChange = (event: any, data: any) => {
  this.setState({ newEquipmentStatus: data.value})
  }

  onAttachButtonClick = (equipmentId: string) => {
    this.props.history.push(`/equipment/${equipmentId}/attach`)
  }

  onEditButtonClick = (equipmentId: string) => {
    this.props.history.push(`/equipment/${equipmentId}/edit`)
  }

  onEquipmentCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newEquipment = await createEquipment(this.props.auth.getIdToken(), {
        name: this.state.newEquipmentName,
        status: this.state.newEquipmentStatus
      })
      this.setState({
        equipmentList: [...this.state.equipmentList, newEquipment],
        newEquipmentName: '',
        newEquipmentStatus: 'Up'
      })
    } catch {
      alert('Equipment creation failed')
    }
  }

  onEquipmentDelete = async (equipmentId: string) => {
    try {
      await deleteEquipment(this.props.auth.getIdToken(), equipmentId)
      this.setState({
        equipmentList: this.state.equipmentList.filter(equipment => equipment.equipmentId !== equipmentId)
      })
    } catch {
      alert('Equipment deletion failed')
    }
  }

  //onEquipmentCheck = async (pos: number) => {
    // try {
    //   const equipment = this.state.equipmentList[pos]
    //   await patchEquipment(this.props.auth.getIdToken(), equipment.equipmentId, {
    //     name: equipment.name,
    //     statusChangedAt: equipment.statusChangedAt,
    //     status: equipment.status //!equipment.status
    //   })
    //   this.setState({
    //     equipmentList: update(this.state.equipmentList, {
    //       [pos]: { done: { $set: !equipment.done } }
    //     })
    //   })
    // } catch {
    //   alert('Equipment deletion failed')
    // }
  //}

  async componentDidMount() {
    try {
      const equipmentList = await getEquipmentList(this.props.auth.getIdToken())
      this.setState({
        equipmentList,
        loadingEquipmentList: false
      })
    } catch (e) {
      alert(`Failed to fetch equipment list: ` + JSON.stringify(e))
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Equipment List</Header>

        {this.renderCreateEquipmentInput()}

        {this.renderEquipmentList()}
      </div>
    )
  }

  renderCreateEquipmentInput() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Input
              action={{
                color: 'teal',
                labelPosition: 'left',
                icon: 'add',
                content: 'New Equipment',
                onClick: this.onEquipmentCreate
              }}
              fluid
              actionPosition="left"
              placeholder="Enter equipment name..."
              onChange={this.handleNameChange}
              maxLength="50"
            />
          </Grid.Column>

          <Grid.Column width={8}>
          <Dropdown 
              placeholder="Select an equipment status"
              fluid
              selection
              onChange={this.handleStatusChange}
              options={[{key: 'Up', value: 'Up', text: 'Up'},
                {key: 'Down', value: 'Down', text: 'Down'},
                {key: 'Limited', value: 'Limited', text: 'Limited'}]} />
          </Grid.Column>

          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderEquipmentList() {
    if (this.state.loadingEquipmentList) {
      return this.renderLoading()
    }

    return this.renderEquipmentItems()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Equipment List
        </Loader>
      </Grid.Row>
    )
  }

  renderEquipmentItems() {
    return (
      <Grid padded>
        <Grid.Column width={6}>
          <h3>Equipment Name</h3>
        </Grid.Column>
        <Grid.Column width={3}>
          <h3>Status</h3>
        </Grid.Column>
        <Grid.Column width={4}>
          <h3>Status Changed At</h3>
        </Grid.Column>
        <Grid.Column width={1}>
          <h3>Edit</h3>
        </Grid.Column>
        <Grid.Column width={1}>
          <h3>Attach</h3>
        </Grid.Column>
        <Grid.Column width={1}>
          <h3>Delete</h3>
        </Grid.Column>

        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>

        {this.state.equipmentList.map((equipment, pos) => {
          return (
            <Grid.Row key={equipment.equipmentId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onEquipmentCheck(pos)}
                  checked={equipment.done}
                />
              </Grid.Column> */}

              <Grid.Column width={6} verticalAlign="middle">
                {equipment.name}
              </Grid.Column>

              <Grid.Column width={3} verticalAlign="middle">
                {this.formatStatusLabel(equipment.status)}
              </Grid.Column>

              <Grid.Column width={4}>
                {this.formatStatusDate(equipment.statusChangedAt)}
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="orange"
                  onClick={() => this.onEditButtonClick(equipment.equipmentId)}>
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onAttachButtonClick(equipment.equipmentId)}>
                  <Icon name="attach" />
                </Button>
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onEquipmentDelete(equipment.equipmentId)}>
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              {equipment.attachmentUrl && (
                <Image src={equipment.attachmentUrl} size="small" wrapped />
              )}

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  formatStatusDate(statusChangedAt: string): string {
    return dateFormat(statusChangedAt, 'yyyy-mm-dd HH:MM:ss') as string
  }

  getStatusColor(status: string): string {
    let statusColor = ''
    if ('Up' === status) {
      statusColor = 'green'
    } else if ('Down' === status) {
      statusColor = 'red'
    } else if ('Limited' === status) {
      statusColor = 'orange'
    }
    return statusColor
  }

  formatStatusLabel(status: string) {
    let statusColor = this.getStatusColor(status)
    if ('green' === statusColor)
      return (<Label color="green">{status}</Label>)
    else if ('red' === statusColor)
      return (<Label color="red">{status}</Label>)
    else if ('orange' === statusColor)
      return (<Label color="orange">{status}</Label>)
    else
      return (<Label>{status}</Label>)
  }
}
