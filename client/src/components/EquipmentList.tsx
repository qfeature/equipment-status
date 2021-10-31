import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createEquipment, deleteEquipment, getEquipmentList, patchEquipment } from '../api/equipmentList-api'
import Auth from '../auth/Auth'
import { Equipment } from '../types/Equipment'

interface EquipmentListProps {
  auth: Auth
  history: History
}

interface EquipmentListState {
  equipmentList: Equipment[]
  newEquipmentName: string
  loadingEquipmentList: boolean
}

export class EquipmentList extends React.PureComponent<EquipmentListProps, EquipmentListState> {
  state: EquipmentListState = {
    equipmentList: [],
    newEquipmentName: '',
    loadingEquipmentList: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEquipmentName: event.target.value })
  }

  onEditButtonClick = (equipmentId: string) => {
    this.props.history.push(`/equipment/${equipmentId}/edit`)
  }

  onEquipmentCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      //const dueDate = this.calculateDueDate()
      const status = 'Up' //TODO: placeholder until I modify the UI to have selection for Up/Down/Limited
      const newEquipment = await createEquipment(this.props.auth.getIdToken(), {
        name: this.state.newEquipmentName,
        status //dueDate
      })
      this.setState({
        equipmentList: [...this.state.equipmentList, newEquipment],
        newEquipmentName: ''
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

  onEquipmentCheck = async (pos: number) => {
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
  }

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
      <Grid.Row>
        <Grid.Column width={16}>
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
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
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
        {this.state.equipmentList.map((equipment, pos) => {
          return (
            <Grid.Row key={equipment.equipmentId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onEquipmentCheck(pos)}
                  checked={equipment.done}
                />
              </Grid.Column> */}

              <Grid.Column width={1} verticalAlign="middle">
                {equipment.status}
              </Grid.Column>

              <Grid.Column width={10} verticalAlign="middle">
                {equipment.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {equipment.statusChangedAt}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(equipment.equipmentId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onEquipmentDelete(equipment.equipmentId)}
                >
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
}
