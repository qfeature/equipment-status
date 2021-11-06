import dateFormat from 'dateformat'
import { History } from 'history'
//import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Dropdown,
  Label,
  Accordion,
  Table
} from 'semantic-ui-react'

import { createEquipment, deleteEquipment, getEquipmentList, getFileUploadHistory } from '../api/equipmentList-api'
import Auth from '../auth/Auth'
import { Equipment } from '../types/Equipment'
import { FileHistory } from '../types/FileHistory'
import Swal from 'sweetalert2' // For alert messages

interface EquipmentListProps {
  auth: Auth
  history: History
}

interface EquipmentListState {
  equipmentList: Equipment[]
  newEquipmentName: string
  newEquipmentStatus: string
  loadingEquipmentList: boolean
  activeIndex: number // For Accordian
  fileHistoryList: FileHistory[] // For Accordian
}

export class EquipmentList extends React.PureComponent<EquipmentListProps, EquipmentListState> {
  state: EquipmentListState = {
    equipmentList: [],
    newEquipmentName: '',
    newEquipmentStatus: 'Up',
    loadingEquipmentList: true,
    activeIndex: -1 , // For Accordian
    fileHistoryList: [] // For Accordian
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

  onEditButtonClick = (equipmentId: string, name: string, status: string) => {
    this.props.history.push({
      pathname: `/equipment/${equipmentId}/edit`
      , search:''
      , state: {currentName: name, currentStatus: status}
    })
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

      // alert
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Equipment created!',
        showConfirmButton: true
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not create equipment. Make sure equipment name is between 1 - 100 characters and a status is selected.',
        showConfirmButton: true
      })
    }
  }

  onEquipmentDelete = async (equipmentId: string) => {
    try {
      await deleteEquipment(this.props.auth.getIdToken(), equipmentId)
      this.setState({
        equipmentList: this.state.equipmentList.filter(equipment => equipment.equipmentId !== equipmentId)
      })

      // alert
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Equipment deleted!',
        showConfirmButton: true
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not delete equipment',
        showConfirmButton: true
      })
    }
  }

  onShowFileUploadHistoryClick = async (pos: number) => {
    try {
      const index = pos
      const activeIndex = this.state.activeIndex
      const newIndex = activeIndex === index ? -1 : index
      const equipment = this.state.equipmentList[pos]
      const equipmentId = equipment.equipmentId
      const fileHistory = await getFileUploadHistory(this.props.auth.getIdToken(), equipmentId)
      this.setState({
        activeIndex: newIndex,
        fileHistoryList: fileHistory
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not get file upload history',
        showConfirmButton: true
      })
    }
  }

  async componentDidMount() {
    try {
      const equipmentList = await getEquipmentList(this.props.auth.getIdToken())
      this.setState({
        equipmentList,
        loadingEquipmentList: false
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Unable to fetch equipment list',
        showConfirmButton: true
      })
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
              value={this.state.newEquipmentStatus}
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
          const activeIndex = this.state.activeIndex
          return (
            <Grid.Row key={equipment.equipmentId}>
              <Grid.Column width={6} verticalAlign="middle">
                <h4>{equipment.name}</h4>
              </Grid.Column>

              <Grid.Column width={3} verticalAlign="middle">
                {this.formatStatusLabel(equipment.status)}
              </Grid.Column>

              <Grid.Column width={4} verticalAlign="middle">
                {dateFormat(equipment.statusChangedAt, 'yyyy-mm-dd HH:MM:ss')}
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="orange"
                  onClick={() => this.onEditButtonClick(equipment.equipmentId, equipment.name, equipment.status)}>
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

              {equipment.attachmentUrl && (
                <Grid.Column width={16}>
                  <Accordion fluid>
                    <Accordion.Title
                      active={activeIndex === pos}
                      index={pos}
                      onClick={() => this.onShowFileUploadHistoryClick(pos)}
                    >
                      <Icon name='dropdown' /> <strong>File upload history</strong>
                    </Accordion.Title>

                    <Accordion.Content active={activeIndex === pos}>
                      <Table>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>Event Name</Table.HeaderCell>
                            <Table.HeaderCell>Event Time</Table.HeaderCell>
                            <Table.HeaderCell>File Size</Table.HeaderCell>
                            <Table.HeaderCell>File Etag</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                        {
                          this.state.fileHistoryList.map((fileHist, pos2) => {
                            return (
                              <Table.Row key={pos2}>
                                <Table.Cell>{fileHist.eventName}</Table.Cell>
                                <Table.Cell>{dateFormat(fileHist.eventTime, 'yyyy-mm-dd HH:MM:ss')}</Table.Cell>
                                <Table.Cell>{fileHist.fileSize}</Table.Cell>
                                <Table.Cell>{fileHist.fileEtag}</Table.Cell>
                              </Table.Row>
                            )
                          })
                        }
                        </Table.Body>
                      </Table>
                    </Accordion.Content>
                  </Accordion>
                </Grid.Column>
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

  formatStatusLabel(status: string) {
    if ('Up' === status)
      return (<Label color="green">{status}</Label>)
    else if ('Down' === status)
      return (<Label color="red">{status}</Label>)
    else if ('Limited' === status)
      return (<Label color="orange">{status}</Label>)
    else
      return (<Label>{status}</Label>)
  }

}