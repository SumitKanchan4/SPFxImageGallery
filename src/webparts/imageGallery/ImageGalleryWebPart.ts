import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneChoiceGroup,
  IPropertyPaneChoiceGroupOption
} from '@microsoft/sp-webpart-base';
import { SPListOperations, BaseTemplate, SPHelperCommon } from 'spfxhelper';

import * as strings from 'imageGalleryStrings';
import ImageGallery from './components/ImageGallery';
import { IImageGalleryProps } from './components/IImageGalleryProps';
import { IImageGalleryWebPartProps } from './IImageGalleryWebPartProps';

export default class ImageGalleryWebPart extends BaseClientSideWebPart<IImageGalleryWebPartProps> {

  // flag to check if the lists are fetched
  private listsFetched: boolean = false;
  private dropdownOptions: IPropertyPaneDropdownOption[];

  private _choicGroup: IPropertyPaneChoiceGroupOption[];
  private get choiceOptions(): IPropertyPaneChoiceGroupOption[] {

    if (SPHelperCommon.isNull(this._choicGroup)) {
      var options: Array<IPropertyPaneChoiceGroupOption> = new Array<IPropertyPaneChoiceGroupOption>();

      let imgCarousel: string = "https://spoprod-a.akamaihd.net/files/sp-client-prod_2017-08-04.008/image_choicegroup_carousel_82b63fce.png";
      let imgTiles: string = "https://spoprod-a.akamaihd.net/files/sp-client-prod_2017-08-04.008/image_choicegroup_grid_0503466b.png";
      let imgList:string = 'https://spoprod-a.akamaihd.net/files/sp-client-prod_2017-08-04.008/image_choicegroup_list_f5a84202.png';

      options.push({ checked: true, imageSrc: imgCarousel, key: "Carousel", text: "Carousel", selectedImageSrc: imgCarousel });
      options.push({ checked: false, imageSrc: imgTiles, key: "Grid", text: "Grid", selectedImageSrc: imgTiles });
      options.push({ checked: false, imageSrc: imgList, key: "List", text: "List", selectedImageSrc: imgList });
      this._choicGroup = options;
    }
    return this._choicGroup;
  }

  private get disableRowCount(): boolean {
    return this.properties.layout == 'Carousel' ? true : false;
  }

  public render(): void {
    const element: React.ReactElement<IImageGalleryProps> = React.createElement(
      ImageGallery,
      {
        libName: this.properties.libName,
        imageCountInRow: parseInt(this.properties.imageCountInRow),
        maxImage: parseInt(this.properties.maxImage),
        createLink: this.properties.createLink,
        spHttpClient: this.context.spHttpClient,
        webUrl: this.context.pageContext.web.absoluteUrl,
        layout: this.properties.layout,
        autoRotate: this.properties.autoRotate
      }
    );

    
    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private validateInput(value: string): string {
    if (/^[0-9]{1,10}$/.test(value)) {
      return '';
    }
    else {
      return 'Please enter digit only';
    }
  }

  private getImageLibraries(): Promise<IPropertyPaneDropdownOption[]> {
    var options: Array<IPropertyPaneDropdownOption> = new Array<IPropertyPaneDropdownOption>();

    let oListOpr: SPListOperations = SPListOperations.getInstance(this.context.spHttpClient, this.context.pageContext.web.absoluteUrl);

    return oListOpr.getListsDetailsByBaseTemplateID(BaseTemplate.PictureLibrary).then((response) => {

      if (response.ok) {
        response.result.value.forEach(element => {
          options.push({ key: element.Title, text: element.Title });
        });
      }
      return Promise.resolve(options);
    });


  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    if (!this.listsFetched) {

      this.getImageLibraries().then((response) => {
        this.dropdownOptions = response;
        this.listsFetched = true;
        // now refresh the property pane.
        this.context.propertyPane.refresh();
        this.onDispose();
      });
    }

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneDropdown('libName', {
                  label: 'Enter the name of the library',
                  options: this.dropdownOptions
                }),
                PropertyPaneChoiceGroup('layout', {
                  label: 'Layout',
                  options: this.choiceOptions
                }),
                PropertyPaneSlider('imageCountInRow', {
                  label: "Select the max number of images in a row",
                  max: 6,
                  min: 1,
                  step: 1,
                  showValue: true,
                  value: 3,
                  disabled: this.properties.layout != 'Grid'
                }),
                PropertyPaneTextField('maxImage', {
                  label: 'Enter the max images to be shown (0 to show all)',
                  onGetErrorMessage: this.validateInput.bind(this),
                  value: '0'
                }),
                PropertyPaneToggle('createLink', {
                  label: 'Create redirect link',
                  checked: true,
                  offText: 'No redirect link will be created on the image',
                  onText: 'To create a redirect link need to have a "Redirect" (single line of text) column in the library'
                }),
                PropertyPaneToggle('autoRotate', {
                  label: 'Autorotates the carousel',
                  checked: true,
                  offText: 'Autorotate  Off',
                  onText: 'Autorotate On',
                  disabled: this.properties.layout != 'Carousel'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
