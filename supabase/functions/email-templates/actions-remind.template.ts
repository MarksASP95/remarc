import { ActionToRemind } from "../models/actions-to-remind.model.ts";

export const actionsRemindTemplate = (actionsToRemind: ActionToRemind[]) => {

  const getActionsTemplate = (actions: ActionToRemind[]): string => {
    return actions.map((action) => `
      <tr>
        <p style="margin: 0; font-weight: bold; font-size: 1rem">${ action.name } - ${ new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(action.next_at)) }</p>
        <p style="padding-left: 20px; margin-top: 0;"> ${ action.entity_name }</p>
        <br />
      </tr>
    `).join("");
  }

  return `
    <p>You set up reminders for the following actions:</p>

    <br />

    <table>
      <tbody>
        ${ getActionsTemplate(actionsToRemind) }
      </tbody>
    </table>
  `
}