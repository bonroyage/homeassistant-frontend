import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent } from "../../../../../common/dom/fire_event";
import { hasTemplate } from "../../../../../common/string/has-template";
import type { HaDurationData } from "../../../../../components/ha-duration-input";
import "../../../../../components/ha-duration-input";
import { DelayAction } from "../../../../../data/script";
import { HomeAssistant } from "../../../../../types";
import { ActionElement } from "../ha-automation-action-row";
import { createDurationData } from "../../../../../common/datetime/create_duration_data";

@customElement("ha-automation-action-delay")
export class HaDelayAction extends LitElement implements ActionElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public disabled = false;

  @property({ attribute: false }) public action!: DelayAction;

  @state() private _timeData?: HaDurationData;

  public static get defaultConfig(): DelayAction {
    return { delay: "" };
  }

  public willUpdate(changedProperties: PropertyValues) {
    if (!changedProperties.has("action")) {
      return;
    }
    // Check for templates in action. If found, revert to YAML mode.
    if (this.action && hasTemplate(this.action)) {
      fireEvent(
        this,
        "ui-mode-not-available",
        Error(this.hass.localize("ui.errors.config.no_template_editor_support"))
      );
      return;
    }

    this._timeData = createDurationData(this.action.delay);
    this._minimumDelayTimeData = createDurationData(this.action.minimum_delay);
  }

  protected render() {
    return html`
      <ha-duration-input
        .label=${this.hass.localize(
          `ui.panel.config.automation.editor.actions.type.delay.delay`
        )}
        .disabled=${this.disabled}
        .data=${this._timeData}
        enableMillisecond
        @value-changed=${this._valueChanged}
      ></ha-duration-input>
      <ha-formfield
        .disabled=${this.disabled}
        .label=${this.hass.localize(
          "ui.panel.config.automation.editor.actions.type.delay.randomize"
        )}
      >
        <ha-switch
          .checked=${this.action.randomize ?? false}
          .disabled=${this.disabled}
          @change=${this._randomizedChanged}
        ></ha-switch>
      </ha-formfield>
      ${this.action.randomize
        ? html`
            <ha-duration-input
              .label=${this.hass.localize(
                `ui.panel.config.automation.editor.actions.type.delay.minimum_delay`
              )}
              .disabled=${this.disabled}
              .data=${this._minimumDelayTimeData}
              enableMillisecond
              @value-changed=${this._minimumDelayChanged}
            ></ha-duration-input>
          `
        : ""}
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const value = ev.detail.value;
    if (!value) {
      return;
    }
    fireEvent(this, "value-changed", {
      value: { ...this.action, delay: value },
    });
  }

  private _minimumDelayChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const value = ev.detail.value;
    if (!value) {
      return;
    }
    fireEvent(this, "value-changed", {
      value: { ...this.action, minimum_delay: value },
    });
  }

  private _randomizedChanged(ev) {
    fireEvent(this, "value-changed", {
      value: { ...this.action, randomize: ev.target.checked },
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-duration-input {
        display: block;
        margin-bottom: 24px;
      }

      ha-formfield {
        display: block;
        margin-bottom: 24px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-automation-action-delay": HaDelayAction;
  }
}
