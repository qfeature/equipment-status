import * as React from 'react'
import { Form, Button, Dropdown, Grid, Segment, Divider} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { updateEquipment } from '../api/equipmentList-api'
import { History } from 'history'
import Swal from 'sweetalert2'

interface EditEquipmentProps {
  match: {
    params: {
      equipmentId: string
    }
  }
  auth: Auth
  history: History
}

interface EditEquipmentState {
  newEquipmentName: string
  newEquipmentStatus: string
}

export class EditEquipment extends React.PureComponent<EditEquipmentProps,EditEquipmentState> {
  state: EditEquipmentState = {
    newEquipmentName: '', 
    newEquipmentStatus: 'Up'
  }

  handleStatusChange = (event: any, data: any) => {
    this.setState({ newEquipmentStatus: data.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      const equipmentToEdit: any = this.props.history.location.state

      const newName = equipmentToEdit.currentName // Decision: Name will stay unchanged.
      const newStatus = this.state.newEquipmentStatus

      await updateEquipment(
         this.props.auth.getIdToken(),
         this.props.match.params.equipmentId,
         {name: newName, status: newStatus})

      // alert
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Status changed!',
        showConfirmButton: true
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not change status',
        showConfirmButton: true
      })
    }
  }

  render() {
    const equipmentToEdit: any = this.props.history.location.state
    return (
      <div>
        <h1>Change Equipment Status</h1>

        <Segment placeholder>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
              <h3>Name: {equipmentToEdit.currentName}</h3>

              <h3>Status: {equipmentToEdit.currentStatus}</h3>
            </Grid.Column>

            <Grid.Column verticalAlign='middle'>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                  <Form.Field>
                    <h3>New Status</h3>
                    <Dropdown 
                      placeholder="New status"
                      fluid
                      selection
                      value={this.state.newEquipmentStatus}
                      onChange={this.handleStatusChange}
                      options={[{key: 'Up', value: 'Up', text: 'Up'},
                        {key: 'Down', value: 'Down', text: 'Down'},
                        {key: 'Limited', value: 'Limited', text: 'Limited'}]} />
                  </Form.Field>

                  <Form.Field>
                    <h3>Action </h3>
                    {this.renderButton()}
                  </Form.Field>
                </Form.Group>
              </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>TO</Divider>
        </Segment>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        <Button type="submit" color="blue">
          Save
        </Button>
      </div>
    )
  }
}
