import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'lib-component-custom-slide-toggle',
    templateUrl: './custom-slide-toggle.component.html',
    styleUrls: ['./custom-slide-toggle.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomSlideToggleComponent),
            multi: true
        }
    ]
})
export class CustomSlideToggleComponent implements ControlValueAccessor {

    @Input() checkedValue = '';
    @Input() uncheckedValue = '';

    protected _value = false;
    private onChange: (value: unknown) => void = () => null;
    private onTouched: () => void = () => null;

    get value(): unknown {
        return this._value;
    }

    set value(value: boolean) {
        let returnValue: unknown = value;
        if (value && this.checkedValue) {
            returnValue = this.checkedValue;
        } else if (!value && this.uncheckedValue) {
            returnValue = this.uncheckedValue;
        }
        
        if (value !== this._value) {
            this._value = value;
            this.onChange(returnValue);
        }
    }

    writeValue(value: unknown): void {
        if (value === this.checkedValue) {
            this._value  = true;
        } else if (value === this.uncheckedValue) {
            this._value  = false;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    toggle(): void {
        this.value = !this.value;
    }
}