import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log, Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneChoiceGroup,
  PropertyPaneSlider,
  PropertyPaneToggle,
  IPropertyPaneGroup,
  PropertyPaneLabel,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPListOperations, BaseTemplate, ISPBaseResponse } from 'spfxhelper';
import ImageGallery from './components/ImageGallery';
import { Constants, IImageGalleryProps } from './components/IImageGalleryProps';

const LOGS: string = "SPFxImageGallery";

export interface IImageGalleryWebPartProps {
  layout: string;
  colCount: number;
  isAutorotate: boolean;
  duration: number;
  listName: string;
  imagesCount: number;
  currentSite: boolean;
  siteUrl: string;
}

export default class ImageGalleryWebPart extends BaseClientSideWebPart<IImageGalleryWebPartProps> {

  public libsOptions: IPropertyPaneDropdownOption[] = [];


  public render(): void {

    if (!this.properties.listName)
      this.getLibraries(this.properties.siteUrl ? this.properties.siteUrl : this.context.pageContext.web.absoluteUrl);

    const element: React.ReactElement<IImageGalleryProps> = React.createElement(
      ImageGallery,
      {
        layout: this.properties.layout,
        spHttpClient: this.context.spHttpClient,
        loggerName: LOGS,
        webUrl: this.properties.siteUrl ? this.properties.siteUrl : this.context.pageContext.web.absoluteUrl,
        listName: this.properties.listName,
        colCount: this.properties.colCount,
        isAutorotate: this.properties.isAutorotate,
        duration: this.properties.duration * 1000,
        imagesCount: this.properties.imagesCount,
        propertyPane: this.context.propertyPane
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  public onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {


    switch (propertyPath) {
      case `currentSite`:
        this.properties.siteUrl = newValue as boolean ? this.context.pageContext.web.absoluteUrl : `https://`;
        this.getLibraries(this.properties.siteUrl);
        break;
      case `siteUrl`:
        this.getLibraries(newValue);
        break;
      default:
        this.getLibraries(this.properties.siteUrl);
        break;
    }    
  }

  /**
   * Retreives the libraries from the url and returns error if any
   * @param siteUrl site url to get libraries from
   */
  private async getLibraries(siteUrl: string): Promise<string> {

    let options: IPropertyPaneDropdownOption[] = [];
    let errorMessage: string = undefined;

    try {

      let spListOps: SPListOperations = new SPListOperations(this.context.spHttpClient, siteUrl, LOGS);

      let response: ISPBaseResponse = await spListOps.getListsDetailsByBaseTemplateID(BaseTemplate.DocumentLibrary);
      if (response.ok) {

        response.result.value.forEach(libs => {
          options.push({ key: libs["Title"], text: libs["Title"] });
        });
      }
      else {
        errorMessage = `Invalid site URL`;
        options = [];
      }
    }
    catch (error) {
      Log.error(LOGS, new Error(`Invalid site`));
      Log.error(LOGS, error);
      options = [];
    }

    this.libsOptions = options;
    this.context.propertyPane.refresh();
    return errorMessage;
  }

  /**
   * Returns the property pane controls for the carousel
   */
  protected get getCarouselConfigurationControls(): IPropertyPaneGroup {

    let grp: IPropertyPaneGroup = {
      groupName: `Configure Auto-rotate`,
      groupFields: [
        PropertyPaneToggle('isAutorotate', { label: `Select Autorotation`, offText: 'Off', onText: 'On' }),
        PropertyPaneSlider('duration', { max: 10, min: 2, label: `Select the duration for autorotation (in sec)`, disabled: !this.properties.isAutorotate }),
        PropertyPaneSlider('imagesCount', { max: Constants.CaroselMax, min: -1, label: `Select the maximum number of images to be displayed` })
      ]
    };
    return grp;
  }

  /**
   * Returns the property pane controls for the List
   */
  protected get getListConfigurationControls(): IPropertyPaneGroup {

    let grp: IPropertyPaneGroup = {
      groupName: `Configure List`,
      groupFields: [
        PropertyPaneSlider('imagesCount', { max: Constants.ListMax, min: -1, label: `Select the maximum number of images to be displayed` }),
        PropertyPaneSlider('colCount', { max: 4, min: 2, label: `Select the maximum number of images to be displayed in a row` })
      ]
    };
    return grp;
  }

  /**
   * Returns the property pane controls for the LightBox
   */
  protected get getLightBoxConfigurationControls(): IPropertyPaneGroup {

    let grp: IPropertyPaneGroup = {
      groupName: `Configure Lighbox`,
      groupFields: [
        PropertyPaneSlider('colCount', { max: 4, min: 1, label: `Select the number of columns`, value: 3 }),
        PropertyPaneSlider('imagesCount', { max: Constants.LightboxMax, min: -1, label: `Select the maximum number of images to be displayed`, value: -1 }),
        PropertyPaneLabel('', { text: '*Select the value as -1 to display all the images' })
      ]
    };
    return grp;
  }

  /**
   * Checks for the valid URL
   * @param value values entered in the site url text box in property pane
   */
  private getErrorMessage(value: string): Promise<string> {

    return this.getLibraries(value).then(msg => {
      return msg;
    });
  }

  /**
   * Returns the property pane controls for the source configuration
   */
  protected get getSourceConfiguration(): IPropertyPaneGroup {

    let grp: IPropertyPaneGroup = {
      groupName: `Select Source`,
      groupFields: [
        PropertyPaneToggle('currentSite', { label: `Source of images`, onText: `Current Site`, offText: `Other Site`, offAriaLabel: `Other Site`, onAriaLabel: `Current Site`, checked: true }),
        PropertyPaneTextField('siteUrl', { onGetErrorMessage: (value) => this.getErrorMessage(value), underlined: true, placeholder: `${this.properties.currentSite ? this.context.pageContext.web.absoluteUrl : 'Enter Site Url'}`, disabled: this.properties.currentSite }),
        PropertyPaneDropdown('listName', { options: this.libsOptions, label: `Select Library`, disabled: this.libsOptions.length == 0, selectedKey: this.properties.listName })
      ]
    };

    return grp;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: `SPFx Image Gallery Configuration`
          },
          groups: [
            this.getSourceConfiguration,
            {
              groupName: `Select Layout`,
              groupFields: [
                PropertyPaneChoiceGroup('layout', {
                  options: [
                    { key: 'carousel', text: 'Carousel', imageSrc: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATFJREFUWAljYBgFAxwCjMbGxv8H0g1MA2k5yG4WmAPOnj3LCGPTg4aF/ICHwKgDRkNgcIeAmZmZCa2zJNYQ8PT0ZAfm00t///49DXSEPrmOAJqxDpTfTUxMenGZgeEABwcHjtevXx8CatBlZGT0OnXq1EVcmgmJAwu3IKCajv///xcBHdGCTT2GAz5//vwcqMEMZPmZM2e2Y9NEihjQjCqg+g1AM6uBjshG14vhADExMQmgopNADduAGvzRNZDCb2hoYAKasRKoJwCIU4GOmYquH8MB27dv/6mkpGQHDIHzQEdsoCQNbN68+QDQwlCgWVHA6JiDbjmYD0okIIxN0tzc3AKbODXEYPZihACy4SdPnjyBzKcFG68DaGEhupmjDhgNgQEPgdFmOXq2HOWPvBAAANZ5W4HFvWNLAAAAAElFTkSuQmCC`, selectedImageSrc: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATFJREFUWAljYBgFAxwCjMbGxv8H0g1MA2k5yG4WmAPOnj3LCGPTg4aF/ICHwKgDRkNgcIeAmZmZCa2zJNYQ8PT0ZAfm00t///49DXSEPrmOAJqxDpTfTUxMenGZgeEABwcHjtevXx8CatBlZGT0OnXq1EVcmgmJAwu3IKCajv///xcBHdGCTT2GAz5//vwcqMEMZPmZM2e2Y9NEihjQjCqg+g1AM6uBjshG14vhADExMQmgopNADduAGvzRNZDCb2hoYAKasRKoJwCIU4GOmYquH8MB27dv/6mkpGQHDIHzQEdsoCQNbN68+QDQwlCgWVHA6JiDbjmYD0okIIxN0tzc3AKbODXEYPZihACy4SdPnjyBzKcFG68DaGEhupmjDhgNgQEPgdFmOXq2HOWPvBAAANZ5W4HFvWNLAAAAAElFTkSuQmCC` },
                    { key: 'list', text: 'List', iconProps: { officeFabricIconFontName: 'GroupedList' } },
                    { key: 'lightbox', text: 'LightBox', iconProps: { officeFabricIconFontName: 'GridViewSmall' } }
                  ]
                })
              ]
            },
            this.properties.layout === 'carousel' ?
              this.getCarouselConfigurationControls
              :
              this.properties.layout === 'list' ?
                this.getListConfigurationControls
                :
                this.getLightBoxConfigurationControls

          ]
        }
      ]
    };
  }
}
