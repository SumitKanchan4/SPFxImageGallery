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
  PropertyPaneToggle
} from '@microsoft/sp-webpart-base';
import { SPListOperations, BaseTemplate } from 'spfxhelper';

import * as strings from 'imageGalleryStrings';
import ImageGallery from './components/ImageGallery';
import { IImageGalleryProps } from './components/IImageGalleryProps';
import { IImageGalleryWebPartProps } from './IImageGalleryWebPartProps';

export default class ImageGalleryWebPart extends BaseClientSideWebPart<IImageGalleryWebPartProps> {

  // flag to check if the lists are fetched
  private listsFetched: boolean = false;
  private dropdownOptions: IPropertyPaneDropdownOption[];


  public render(): void {
    const element: React.ReactElement<IImageGalleryProps> = React.createElement(
      ImageGallery,
      {
        libName: this.properties.libName,
        imageCountInRow: parseInt(this.properties.imageCountInRow),
        maxImage: parseInt(this.properties.maxImage),
        createLink: this.properties.createLink,
        spHttpClient: this.context.spHttpClient,
        webUrl: this.context.pageContext.web.absoluteUrl
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
                PropertyPaneSlider('imageCountInRow', {
                  label: "Select the max number of images in a row",
                  max: 6,
                  min: 1,
                  step: 1,
                  showValue: true,
                  value: 3
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
