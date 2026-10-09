import { ChangeDetectionStrategy, ChangeDetectorRef, Component, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { InputTypeEnum } from '../../../global/interface/input-form.enum';
import { InputBase } from '../input.directive';

interface SelectionOptionI {
  key:string;
  label:string;
  value:unknown;
  children?:SelectionOptionI[];
  source:Record<string,unknown>;
}

@Component({
  selector:'pus-inputs-selections',
  standalone:false,
  templateUrl:'./inputs-selections.component.html',
  styleUrl:'./inputs-selections.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class InputsSelectionsComponent extends InputBase {
  readonly InputType=InputTypeEnum;

  normalizedOptions:SelectionOptionI[]=[];
  suggestions:SelectionOptionI[]=[];

  constructor(cdr:ChangeDetectorRef){super(cdr);}

  override ngOnChanges(changes:SimpleChanges):void {
    super.ngOnChanges(changes);

    if(changes['dataKey']){
      this.normalizedOptions=this.options.map((option,index)=>this.normalize(option,index));
      this.suggestions=[...this.normalizedOptions];
    }
  }

  search(event:{query:string}):void {
    const query=event.query?.trim().toLocaleLowerCase()??'';

    this.suggestions=this.normalizedOptions.filter(option=>
      option.label.toLocaleLowerCase().includes(query)
    );

    this.cdr.markForCheck();
  }

  get treeOptions():TreeNode[] {
    const convert=(option:SelectionOptionI):TreeNode=>({
      key:option.key,
      label:option.label,
      data:option.value,
      children:option.children?.map(child=>convert(child))
    });

    return this.normalizedOptions.map(option=>convert(option));
  }

  get cascadeOptions():SelectionOptionI[] {
    return this.normalizedOptions;
  }

  private normalize(option:Record<string,unknown>,index:number,parent=''):SelectionOptionI {
    const key=String(option['_id']??option['id']??option['value']??`${parent}${index}`);

    const label=String(
      option['label']??
      option['name']??
      option['title']??
      option['value']??
      key
    );

    const value=
      option['value']??
      option['_id']??
      option['id']??
      option;

    const childrenRaw=this.getChildren(option);

    return {
      key,
      label,
      value,
      source:option,
      children:childrenRaw.length
        ?childrenRaw.map((child,childIndex)=>this.normalize(child,childIndex,`${key}-`))
        :undefined
    };
  }

  private getChildren(option:Record<string,unknown>):Record<string,unknown>[] {
    const children=option['children']??option['resources'];

    if(!Array.isArray(children)) return [];

    return children.filter(
      (child):child is Record<string,unknown> =>
        child!==null&&typeof child==='object'&&!Array.isArray(child)
    );
  }
}